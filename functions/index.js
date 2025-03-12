const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");
const axios = require("axios");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();
const storage = getStorage();

// Initialize OpenAI
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: "sk-4c1d60d9bae043ca8500b98876e1534d", // Set this in Firebase environment config
});

/**
 * Generate meal recommendations based on user preferences
 */
exports.generateMealRecommendations = onCall({
  maxInstances: 10,
}, async (request) => {
  try {
    const {preferences = {}, count = 3} = request.data;
    const {uid} = request.auth;

    if (!uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Build prompt based on preferences
    const prompt = buildMealPrompt(preferences, count);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {role: "system", content: "You are a professional nutritionist and chef specializing in personalized meal recommendations."},
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    // Parse OpenAI response
    const responseText = completion.choices[0].message.content;
    const mealRecommendations = JSON.parse(responseText);

    // Store recommendations in Firestore
    await db.collection("recommendations").add({
      userId: uid,
      recommendations: mealRecommendations,
      preferences,
      timestamp: new Date(),
    });

    return {
      success: true,
      recommendations: mealRecommendations,
    };
  } catch (error) {
    logger.error("Error generating meal recommendations", {error: error.message});
    throw new HttpsError("internal", "Failed to generate recommendations", error);
  }
});

/**
 * Analyze recipe and provide nutritional insights
 */
exports.analyzeRecipe = onCall({
  maxInstances: 10,
}, async (request) => {
  try {
    const {recipe} = request.data;
    const {uid} = request.auth;

    if (!uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    if (!recipe || !recipe.ingredients) {
      throw new HttpsError("invalid-argument", "Recipe details required");
    }

    // Build prompt for recipe analysis
    const prompt = `
      Analyze this recipe and provide detailed nutritional information:
      
      Name: ${recipe.name}
      
      Ingredients:
      ${recipe.ingredients.join("\n")}
      
      Instructions:
      ${recipe.instructions ? recipe.instructions.join("\n") : "Not provided"}
      
      Please provide: 
      1. Approximate macronutrients (protein, carbs, fat) per serving
      2. Estimated calories per serving
      3. Key vitamins and minerals
      4. Potential allergens
      5. Healthiness score (1-10)
      6. Suggestions for making it healthier
      
      Format as JSON with the following structure:
      {
        "macros": {
          "protein": "X g",
          "carbs": "X g",
          "fat": "X g"
        },
        "calories": "X kcal",
        "vitamins": ["vitamin A", "vitamin C", ...],
        "minerals": ["calcium", "iron", ...],
        "allergens": ["dairy", "gluten", ...],
        "healthScore": X,
        "healthSuggestions": ["suggestion 1", "suggestion 2", ...]
      }
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {role: "system", content: "You are a professional nutritionist who analyzes recipes with scientific accuracy."},
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    // Parse OpenAI response
    const responseText = completion.choices[0].message.content;
    const analysis = JSON.parse(responseText);

    // Cache results for future reference
    await db.collection("recipeAnalysis").add({
      recipeId: recipe.id || null,
      recipeName: recipe.name,
      analysis,
      timestamp: new Date(),
    });

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    logger.error("Error analyzing recipe", {error: error.message});
    throw new HttpsError("internal", "Failed to analyze recipe", error);
  }
});

/**
 * Calculate nutritional information for a recipe
 */
exports.calculateRecipeNutrition = onCall({
  maxInstances: 10,
}, async (request) => {
  try {
    const {recipe} = request.data;

    if (!recipe || !recipe.ingredients || !recipe.ingredients.length) {
      throw new HttpsError("invalid-argument", "Recipe with ingredients required");
    }

    const prompt = `
      Calculate precise nutritional information for this recipe:
      
      Name: ${recipe.name}
      Servings: ${recipe.servings || "1"}
      
      Ingredients:
      ${recipe.ingredients.join("\n")}
      
      Please provide nutritional information per serving with the following structure:
      {
        "calories": X,
        "protein": X,
        "carbs": X,
        "fat": X,
        "fiber": X,
        "sugar": X,
        "sodium": X,
        "potassium": X,
        "calcium": X,
        "iron": X,
        "vitaminA": X,
        "vitaminC": X,
        "vitaminD": X
      }
      
      All values should be numbers only without units. Use best estimates based on standard nutritional databases.
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {role: "system", content: "You are a nutrition calculation system that provides accurate nutritional data for recipes."},
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    const responseText = completion.choices[0].message.content;
    const nutrition = JSON.parse(responseText);

    // If this is a saved recipe, update it with the nutrition data
    if (recipe.id) {
      await db.collection("recipes").doc(recipe.id).update({
        nutrition,
        updatedAt: new Date()
      });
    }

    return {
      success: true,
      nutrition,
    };
  } catch (error) {
    logger.error("Error calculating recipe nutrition", {error: error.message});
    throw new HttpsError("internal", "Failed to calculate nutrition", error);
  }
});

/**
 * Generate a custom recipe based on parameters
 */
exports.generateRecipe = onCall({
  maxInstances: 5,
}, async (request) => {
  try {
    const {
      ingredients = [],
      cuisine = null,
      dietType = null,
      mealType = null,
      difficulty = "medium",
      prepTime = null,
      excludeIngredients = []
    } = request.data;
    
    const {uid} = request.auth;
    
    if (!uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Build the prompt for recipe generation
    const prompt = `
      Create a complete recipe with the following constraints:
      
      ${ingredients.length > 0 ? `Must use these ingredients: ${ingredients.join(", ")}` : ""}
      ${cuisine ? `Cuisine: ${cuisine}` : ""}
      ${dietType ? `Diet Type: ${dietType}` : ""}
      ${mealType ? `Meal Type: ${mealType}` : ""}
      ${difficulty ? `Difficulty Level: ${difficulty}` : ""}
      ${prepTime ? `Preparation Time: ${prepTime} minutes or less` : ""}
      ${excludeIngredients.length > 0 ? `Must NOT use these ingredients: ${excludeIngredients.join(", ")}` : ""}
      
      Please format the response as a JSON object with the following structure:
      {
        "name": "Recipe Name",
        "description": "Brief description",
        "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity", ...],
        "instructions": ["step 1", "step 2", ...],
        "prepTime": X,
        "cookTime": X,
        "servings": X,
        "difficulty": "easy/medium/hard",
        "cuisine": "cuisine type",
        "mealType": "breakfast/lunch/dinner/snack",
        "dietType": "omnivore/vegetarian/vegan/etc."
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {role: "system", content: "You are a professional chef specialized in creating delicious and practical recipes."},
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    const responseText = completion.choices[0].message.content;
    const recipe = JSON.parse(responseText);

    // Add metadata about generation
    const generationMetadata = {
      generatedAt: new Date(),
      generatedBy: uid,
      generationParams: {
        ingredients,
        cuisine,
        dietType,
        mealType,
        difficulty,
        prepTime,
        excludeIngredients
      }
    };

    // Save to Firestore with user ID
    const recipeData = {
      ...recipe,
      userId: uid,
      createdAt: new Date(),
      isGenerated: true,
      generationMetadata,
    };

    const docRef = await db.collection("generatedRecipes").add(recipeData);

    return {
      success: true,
      recipe: {
        ...recipe,
        id: docRef.id
      },
    };
  } catch (error) {
    logger.error("Error generating recipe", {error: error.message});
    throw new HttpsError("internal", "Failed to generate recipe", error);
  }
});

/**
 * Generate a meal plan for multiple days
 */
exports.generateMealPlan = onCall({
  maxInstances: 5,
  timeoutSeconds: 120,
}, async (request) => {
  try {
    const {userId, days = 7, preferences = {}} = request.data;
    
    // Get user profile to enrich preferences if needed
    let userProfile = null;
    try {
      const userDoc = await db.collection("users").doc(userId).get();
      if (userDoc.exists) {
        userProfile = userDoc.data();
      }
    } catch (err) {
      logger.warn(`Couldn't fetch user profile for meal plan: ${err.message}`);
    }

    // Combine user profile preferences with request preferences
    const combinedPreferences = {
      ...(userProfile?.preferences || {}),
      ...preferences
    };

    const prompt = `
      Create a meal plan for ${days} days with the following preferences:
      
      Diet type: ${combinedPreferences.diet || "No specific diet"}
      Allergies/restrictions: ${combinedPreferences.allergies?.join(", ") || "None"}
      Cuisine preferences: ${combinedPreferences.cuisines?.join(", ") || "Variety"}
      Health goals: ${combinedPreferences.goals?.join(", ") || "Balanced nutrition"}
      Calories per day target: ${combinedPreferences.caloriesPerDay || "2000-2500"}
      
      Please provide a complete meal plan with breakfast, lunch, dinner, and snacks for each day.
      Format the response as a JSON object with the following structure:
      {
        "days": [
          {
            "day": 1,
            "breakfast": {
              "name": "Meal name",
              "description": "Brief description",
              "ingredients": ["ingredient 1", "ingredient 2", ...],
              "nutrition": {
                "calories": X,
                "protein": X,
                "carbs": X,
                "fat": X
              }
            },
            "lunch": { ... same structure as breakfast ... },
            "dinner": { ... same structure as breakfast ... },
            "snacks": [
              { ... same structure as breakfast ... },
              { ... can have multiple snacks ... }
            ]
          },
          ... repeat for each day ...
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {role: "system", content: "You are a professional meal planner and nutritionist who creates balanced, practical, and delicious meal plans."},
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    const responseText = completion.choices[0].message.content;
    const mealPlan = JSON.parse(responseText);

    return {
      success: true,
      mealPlan,
    };
  } catch (error) {
    logger.error("Error generating meal plan", {error: error.message});
    throw new HttpsError("internal", "Failed to generate meal plan", error);
  }
});

/**
 * Process natural language search for recipes
 */
exports.processNaturalLanguageSearch = onCall({
  maxInstances: 20,
}, async (request) => {
  try {
    const {query, filters = {}} = request.data;

    // First, analyze the natural language query to extract search parameters
    const analyzePrompt = `
      Analyze this recipe search query and extract structured information:
      
      Query: "${query}"
      
      Extract and format as JSON with these fields:
      {
        "ingredients": ["ingredient1", "ingredient2", ...],
        "excludedIngredients": ["excluded1", "excluded2", ...],
        "cuisineType": "cuisine type or null",
        "dishType": "type of dish or null",
        "dietaryRestrictions": ["restriction1", "restriction2", ...],
        "healthPreferences": ["preference1", "preference2", ...],
        "timeConstraint": minutes or null,
        "searchTerms": ["term1", "term2", ...]
      }
    `;

    const analyzeCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a search query analyzer specialized in extracting structured recipe search parameters from natural language."},
        {role: "user", content: analyzePrompt},
      ],
      response_format: {type: "json_object"},
    });

    const analysisText = analyzeCompletion.choices[0].message.content;
    const searchParams = JSON.parse(analysisText);

    // Now perform the search in Firestore
    // This is a simplified version - in production you'd use more robust search
    let recipesQuery = db.collection("recipes");
    
    // Apply filters
    if (searchParams.cuisineType) {
      recipesQuery = recipesQuery.where("cuisine", "==", searchParams.cuisineType);
    }
    
    if (searchParams.dietaryRestrictions?.length > 0) {
      recipesQuery = recipesQuery.where("dietType", "in", searchParams.dietaryRestrictions);
    }
    
    // Fetch recipes
    const snapshot = await recipesQuery.limit(20).get();
    let recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Second-level filtering with AI
    const filterPrompt = `
      I have ${recipes.length} recipes and need to filter them based on this search query: "${query}"
      
      Search parameters extracted:
      ${JSON.stringify(searchParams, null, 2)}
      
      Return the IDs of recipes that best match these criteria, ranked by relevance.
      Format as a JSON array of recipe IDs.
    `;

    // We'd send the recipes data too, but for brevity, I'm simplifying
    const filterCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a recipe filtering system that accurately matches recipes to search criteria."},
        {role: "user", content: filterPrompt},
        {role: "user", content: JSON.stringify(recipes.map(r => ({
          id: r.id,
          name: r.name,
          ingredients: r.ingredients,
          cuisine: r.cuisine,
          dietType: r.dietType,
          prepTime: r.prepTime,
          description: r.description
        })))},
      ],
      response_format: {type: "json_object"},
    });

    const filterResponseText = filterCompletion.choices[0].message.content;
    const matchedIds = JSON.parse(filterResponseText);

    // Get the matched recipes in order
    const results = matchedIds.map(id => recipes.find(r => r.id === id))
                             .filter(r => r !== undefined);

    return {
      success: true,
      results,
      searchParams
    };
  } catch (error) {
    logger.error("Error processing natural language search", {error: error.message});
    throw new HttpsError("internal", "Failed to process search query", error);
  }
});

/**
 * Find substitutes for an ingredient
 */
exports.findIngredientSubstitutes = onCall({
  maxInstances: 10,
}, async (request) => {
  try {
    const {ingredient, dietType = null, allergies = []} = request.data;

    if (!ingredient) {
      throw new HttpsError("invalid-argument", "Ingredient is required");
    }

    const prompt = `
      Suggest substitutes for the following ingredient:
      
      Ingredient: ${ingredient}
      ${dietType ? `Diet type: ${dietType}` : ""}
      ${allergies.length > 0 ? `Allergies to avoid: ${allergies.join(", ")}` : ""}
      
      For each substitute, provide:
      1. Name of substitute
      2. Conversion ratio (e.g., "1:1" or "2 tbsp for every 1 tbsp")
      3. Flavor impact (how it changes the flavor)
      4. Texture impact (how it changes the texture)
      5. Nutrition differences
      
      Format as a JSON array with objects containing these properties.
      Include at least 3 substitutes if available, maximum 5.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a culinary ingredient expert who knows the perfect substitutes for any ingredient."},
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    const responseText = completion.choices[0].message.content;
    const substitutes = JSON.parse(responseText);

    // Cache the results in Firestore
    await db.collection("ingredientSubstitutes").add({
      originalIngredient: ingredient,
      dietType: dietType || "all",
      allergies: allergies || [],
      substitutes: substitutes.substitutes || substitutes,
      timestamp: new Date()
    });

    return {
      success: true,
      substitutes: substitutes.substitutes || substitutes
    };
  } catch (error) {
    logger.error("Error finding ingredient substitutes", {error: error.message});
    throw new HttpsError("internal", "Failed to find substitutes", error);
  }
});

/**
 * Generate search suggestions based on partial query
 */
exports.getSearchSuggestions = onCall({
  maxInstances: 20,
}, async (request) => {
  try {
    const {partialQuery} = request.data;

    if (!partialQuery || partialQuery.length < 2) {
      return {
        success: true,
        suggestions: []
      };
    }

    const prompt = `
      Generate 5 search suggestions for recipe search based on this partial query:
      
      Partial query: "${partialQuery}"
      
      Format as a JSON array of strings, with the most relevant suggestions first.
      Suggestions should be complete recipe search queries.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a recipe search suggestion system that provides helpful and relevant search completions."},
        {role: "user", content: prompt},
      ],
      response_format: {type: "json_object"},
    });

    const responseText = completion.choices[0].message.content;
    const suggestionsObj = JSON.parse(responseText);
    const suggestions = suggestionsObj.suggestions || suggestionsObj;

    return {
      success: true,
      suggestions: Array.isArray(suggestions) ? suggestions : []
    };
  } catch (error) {
    logger.error("Error generating search suggestions", {error: error.message});
    throw new HttpsError("internal", "Failed to generate suggestions", error);
  }
});

/**
 * Process AI chatbot requests
 */
exports.processAIChatRequest = onCall({
  maxInstances: 10,
}, async (request) => {
  try {
    const {messages, userId} = request.data;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new HttpsError("invalid-argument", "Valid messages array required");
    }
    
    // Get user profile and preferences if available
    let userContext = "";
    if (userId) {
      try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userContext = `
            User Information:
            - Diet type: ${userData.preferences?.diet || "Not specified"}
            - Allergies: ${userData.preferences?.allergies?.join(", ") || "None"}
            - Cuisine preferences: ${userData.preferences?.cuisines?.join(", ") || "Various"}
            - Health goals: ${userData.preferences?.goals?.join(", ") || "None specified"}
          `;
        }
      } catch (err) {
        logger.warn(`Couldn't fetch user profile for chat context: ${err.message}`);
      }
    }
    
    const systemPrompt = `
      You are a helpful AI assistant specialized in nutrition, cooking, and meal planning. 
      Provide accurate, helpful information about recipes, ingredients, cooking techniques, and nutrition.
      
      ${userContext}
      
      Focus on being practical and providing actionable advice. If asked about recipes, include ingredient lists and steps.
      For nutritional questions, provide evidence-based information. For meal planning, consider balance and variety.
      
      If you don't know something, say so rather than providing incorrect information.
      Keep responses friendly, supportive, and encouraging.
    `;
    
    // Prepare messages for API call
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      }))
    ];
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: apiMessages,
    });
    
    const responseMessage = completion.choices[0].message;
    
    // Store the conversation in Firestore if userId provided
    if (userId) {
      await db.collection("chatConversations").add({
        userId,
        messages: [...messages, { role: "assistant", content: responseMessage.content }],
        timestamp: new Date()
      });
    }
    
    return {
      success: true,
      message: responseMessage.content
    };
  } catch (error) {
    logger.error("Error processing chat request", {error: error.message});
    throw new HttpsError("internal", "Failed to process chat request", error);
  }
});

/**
 * Listen for new recipes and automatically generate tags and calculate nutrition
 */
exports.processNewRecipe = onDocumentCreated("recipes/{recipeId}", async (event) => {
  try {
    const recipeData = event.data.data();
    const recipeId = event.params.recipeId;
    
    if (!recipeData || !recipeData.ingredients || recipeData.ingredients.length === 0) {
      logger.warn(`Skipping processing for recipe ${recipeId}: No ingredients found`);
      return;
    }
    
    // TASK 1: Generate tags if they don't exist
    if (!recipeData.tags || recipeData.tags.length === 0) {
      try {
        const tagPrompt = `
          Generate relevant tags for this recipe:
          
          Name: ${recipeData.name}
          Description: ${recipeData.description || ""}
          Category: ${recipeData.category || ""}
          Ingredients: ${recipeData.ingredients.join(", ")}
          
          Return only a JSON array of string tags (maximum 8 tags).
          Tags should be single words or short phrases that describe cuisine type, meal type, flavor profile, etc.
        `;
        
        const tagCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: "You generate relevant tags for recipes."},
            {role: "user", content: tagPrompt},
          ],
          response_format: {type: "json_object"},
        });
        
        const tagResponseText = tagCompletion.choices[0].message.content;
        const tagsObject = JSON.parse(tagResponseText);
        const tags = tagsObject.tags || [];
        
        // Update the recipe document with the tags
        await event.data.ref.update({tags});
        logger.info(`Generated tags for recipe ${recipeId}:`, tags);
      } catch (error) {
        logger.error(`Error generating tags for recipe ${recipeId}:`, error);
      }
    }
    
    // TASK 2: Calculate nutrition if it doesn't exist
    if (!recipeData.nutrition) {
      try {
        const nutritionPrompt = `
          Calculate nutritional information for this recipe:
          
          Name: ${recipeData.name}
          Servings: ${recipeData.servings || "1"}
          Ingredients: ${recipeData.ingredients.join(", ")}
          
          Provide nutrition facts per serving with the following information:
          - Calories
          - Protein (g)
          - Carbohydrates (g)
          - Fat (g)
          - Fiber (g)
          - Sugar (g)
          - Sodium (mg)
          
          Format as a JSON object with numeric values only (no units).
        `;
        
        const nutritionCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {role: "system", content: "You are a nutritional analysis system that provides accurate nutritional data for recipes."},
            {role: "user", content: nutritionPrompt},
          ],
          response_format: {type: "json_object"},
        });
        
        const nutritionResponseText = nutritionCompletion.choices[0].message.content;
        const nutrition = JSON.parse(nutritionResponseText);
        
        // Update the recipe document with nutrition data
        await event.data.ref.update({nutrition});
        logger.info(`Generated nutrition data for recipe ${recipeId}`);
      } catch (error) {
        logger.error(`Error calculating nutrition for recipe ${recipeId}:`, error);
      }
    }
  } catch (error) {
    logger.error("Error in processNewRecipe function", error);
  }
});

/**
 * Helper function to build meal recommendation prompt
 */
function buildMealPrompt(preferences, count) {
  const {
    diet,
    allergies = [],
    cuisines = [],
    goals = [],
    excludedIngredients = [],
    caloriesPerDay,
  } = preferences;

  let prompt = `Please recommend ${count} meal ideas `;

  if (diet) {
    prompt += `for a ${diet} diet `;
  }

  if (allergies.length > 0) {
    prompt += `that avoid these allergens: ${allergies.join(", ")}. `;
  }

  if (cuisines.length > 0) {
    prompt += `Preferred cuisines: ${cuisines.join(", ")}. `;
  }

  if (goals.length > 0) {
    prompt += `Health goals: ${goals.join(", ")}. `;
  }

  if (excludedIngredients.length > 0) {
    prompt += `Please exclude these ingredients: ${excludedIngredients.join(", ")}. `;
  }
  
  if (caloriesPerDay) {
    prompt += `Target approximately ${caloriesPerDay} calories per day. `;
  }

  prompt += `
    For each meal, provide:
    1. Name
    2. Brief description
    3. Main ingredients
    4. Approximate macros (protein, carbs, fat, calories)
    5. Preparation time
    
    Format as a JSON object like this:
    {
      "meals": [
        {
          "name": "Meal name",
          "description": "Brief description",
          "ingredients": ["ingredient 1", "ingredient 2", "..."],
          "macros": {
            "protein": "X g",
            "carbs": "X g",
            "fat": "X g",
            "calories": "X kcal"
          },
          "prepTime": "X minutes"
        },
        {...}
      ]
    }
  `;

  return prompt;
}