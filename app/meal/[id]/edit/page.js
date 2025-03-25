"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import {
  getRecipeById,
  updateRecipe,
  uploadRecipeImage,
} from "@/lib/service/meal";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import Card from "@/component/util/Card";
import Image from "next/image";

const EditMeal = () => {
  const router = useRouter();
  const params = useParams();
  const mealId = params?.id;

  const [imageUploading, setImageUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const [useExternalImage, setUseExternalImage] = useState(false);
  const [externalImageUrl, setExternalImageUrl] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [cookingTime, setCookingTime] = useState("");
  const [servings, setServings] = useState(2);
  const [difficulty, setDifficulty] = useState("Medium");

  // Macros
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  // Ingredients and instructions
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "g" },
  ]);
  const [instructions, setInstructions] = useState([""]);

  // Image upload
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState(null); // Store original image URL

  // Categories
  const categories = [
    "Italian",
    "Chinese",
    "Mexican",
    "Indian",
    "Thai",
    "Mediterranean",
    "American",
    "Japanese",
    "French",
    "Vegetarian",
    "Vegan",
    "Keto",
    "Paleo",
    "Gluten-Free",
  ];

  // Difficulty levels
  const difficultyLevels = ["Easy", "Medium", "Hard"];

  // Fetch meal data and check if user is authenticated and owns the meal
  useEffect(() => {
    const checkAuthAndFetchMeal = async () => {
      setIsFetching(true);

      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setUserId(user.uid);
          try {
            // Fetch meal data
            const mealData = await getRecipeById(mealId);

            // Check if user owns this meal
            if (mealData.userId !== user.uid) {
              setUnauthorized(true);
              setIsFetching(false);
              return;
            }

            // Populate form with meal data
            populateFormWithMealData(mealData);
          } catch (err) {
            console.error("Error fetching meal:", err);
            setError(err.message || "Failed to load meal details");
          } finally {
            setIsFetching(false);
          }
        } else {
          // Not authenticated, redirect to login
          router.push("/");
        }
      });

      return () => unsubscribe();
    };

    if (mealId) {
      checkAuthAndFetchMeal();
    } else {
      setError("No meal ID provided");
      setIsFetching(false);
    }
  }, [router, mealId]);

  // Populate the form with meal data
  const populateFormWithMealData = (meal) => {
    setName(meal.name || "");
    setDescription(meal.description || "");
    setCategory(meal.category || "");
    setPreparationTime(meal.preparationTime?.toString() || "");
    setCookingTime(meal.cookingTime?.toString() || "");
    setServings(meal.servings || 2);
    setDifficulty(meal.difficulty || "Medium");

    // Set macros
    if (meal.macros) {
      const parseValue = (value) => {
        if (typeof value === "number") return value.toString();
        if (!value) return "";
        // Extract just the numeric part from strings like "390 kcal" or "15g"
        const numericValue = value.toString().match(/^(\d+)/);
        return numericValue ? numericValue[0] : "";
      };

      setCalories(parseValue(meal.macros.calories));
      setProtein(parseValue(meal.macros.protein));
      setCarbs(parseValue(meal.macros.carbs));
      setFat(parseValue(meal.macros.fat));
    }

    // Set ingredients with correct format
    if (meal.ingredients && meal.ingredients.length > 0) {
      setIngredients(
        meal.ingredients.map((ing) => ({
          name: ing.name || "",
          quantity: ing.quantity?.toString() || "",
          unit: ing.unit || "g",
        }))
      );
    }

    // Set instructions
    if (meal.instructions && meal.instructions.length > 0) {
      setInstructions(meal.instructions);
    }

    // Set image
    if (meal.image) {
      setOriginalImage(meal.image);
      setImagePreview(meal.image);
      setUseExternalImage(true);
      setExternalImageUrl(meal.image);
    }
  };

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Add file validation
    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Please use an image smaller than 5MB.");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }
    
    setImage(file);
    setError(null); // Clear any previous errors
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setUseExternalImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Add/remove ingredient fields
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "g" }]);
  };

  const removeIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Add/remove instruction steps
  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index) => {
    const newInstructions = [...instructions];
    newInstructions.splice(index, 1);
    setInstructions(newInstructions);
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    try {
      // Generate a safe filename by removing special characters and spaces
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const storageRef = ref(
        storage,
        `meal-images/${userId}/${Date.now()}_${safeFileName}`
      );

      // Add metadata to help with CORS issues
      const metadata = {
        contentType: file.type,
        customMetadata: {
          "uploaded-by": userId || "anonymous",
        },
      };

      // Upload with metadata
      await uploadBytes(storageRef, file, metadata);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error("Image upload failed:", error);

      // If it's likely a CORS error, provide better feedback
      if (
        error.code === "storage/unauthorized" ||
        error.message.includes("CORS")
      ) {
        throw new Error(
          "Image upload failed due to permission settings. Try a smaller image or a different file format."
        );
      }

      throw error;
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("You must be logged in to update a meal");
      return;
    }

    // Validate required fields
    if (!name || !description || !category) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate macros
    if (!calories || !protein || !carbs || !fat) {
      setError("Please provide all macro information");
      return;
    }

    // Check for empty ingredients or instructions
    const hasEmptyIngredient = ingredients.some(
      (ing) => !ing.name || !ing.quantity
    );
    if (hasEmptyIngredient) {
      setError("Please fill in all ingredient details");
      return;
    }

    const hasEmptyInstruction = instructions.some((step) => !step.trim());
    if (hasEmptyInstruction) {
      setError("Please fill in all instruction steps");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Format recipe data
      const recipeData = {
        name,
        description,
        category,
        preparationTime: parseInt(preparationTime, 10) || 0,
        cookingTime: parseInt(cookingTime, 10) || 0,
        servings: parseInt(servings, 10) || 2,
        difficulty,
        macros: {
          calories: parseInt(calories, 10) || 0,
          protein: parseInt(protein, 10) || 0,
          carbs: parseInt(carbs, 10) || 0,
          fat: parseInt(fat, 10) || 0,
        },
        ingredients: ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        instructions: instructions.filter((step) => step.trim()),
        updatedAt: new Date(),
      };

      // Handle image - only update if changed
      if (
        useExternalImage &&
        externalImageUrl &&
        externalImageUrl !== originalImage
      ) {
        // Using external URL
        console.log("Using new external image URL");
        recipeData.image = externalImageUrl;
      } else if (image) {
        // Using uploaded file - use the service function
        try {
          setImageUploading(true);
          console.log("Uploading image using uploadRecipeImage service");
          const imageUrl = await uploadRecipeImage(mealId, image);
          recipeData.image = imageUrl; // This will be both set on recipeData and updated in Firestore
          setImageUploading(false);
        } catch (imageError) {
          setImageUploading(false);
          console.error("Image upload failed:", imageError);
          setError(
            `Failed to upload image: ${imageError.message}. Using previous image if available.`
          );

          // Keep original image if available
          if (originalImage) {
            recipeData.image = originalImage;
          }
        }
      } else if (originalImage) {
        // Keep original image
        recipeData.image = originalImage;
      }

      // Update recipe in Firestore
      await updateRecipe(mealId, recipeData);

      setSuccess(true);

      // Redirect after successful update
      setTimeout(() => {
        router.push(`/meal/${mealId}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating meal:", error);
      setError(error.message || "Failed to update meal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while fetching meal data
  if (isFetching) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-white">Loading meal data...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (unauthorized) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <div className="p-6 text-center">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">
              Unauthorized
            </h3>
            <p className="text-neutral-400 mb-6">
              You {"don't"} have permission to edit this meal.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => router.push(`/meal/${mealId}`)}
            >
              Back to Meal Details
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Edit Meal</h1>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
                Meal updated successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-neutral-700 pb-2">
                  Basic Information
                </h2>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Meal Name*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered bg-neutral-800 text-white w-full"
                    placeholder="Enter meal name"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Description*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered bg-neutral-800 text-white w-full h-24"
                    placeholder="Describe your meal"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Category*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="select select-bordered bg-neutral-800 text-white w-full"
                      required
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Difficulty</span>
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="select select-bordered bg-neutral-800 text-white w-full"
                    >
                      {difficultyLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">
                        Preparation Time (minutes)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={preparationTime}
                      onChange={(e) => setPreparationTime(e.target.value)}
                      className="input input-bordered bg-neutral-800 text-white w-full"
                      placeholder="Preparation time"
                      min="0"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">
                        Cooking Time (minutes)
                      </span>
                    </label>
                    <input
                      type="number"
                      value={cookingTime}
                      onChange={(e) => setCookingTime(e.target.value)}
                      className="input input-bordered bg-neutral-800 text-white w-full"
                      placeholder="Cooking time"
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Servings</span>
                  </label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="input input-bordered bg-neutral-800 text-white w-full"
                    placeholder="Number of servings"
                    min="1"
                  />
                </div>
              </div>

              {/* Meal Image */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Meal Image</span>
                </label>

                {!useExternalImage ? (
                  <>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="file-input file-input-bordered bg-neutral-800 text-white w-full"
                      accept="image/*"
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          className="h-40 object-cover rounded-md"
                          width={300}
                          height={200}
                        />
                      </div>
                    )}

                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => {
                          setUseExternalImage(true);
                          setExternalImageUrl(originalImage || "");
                        }}
                      >
                        Use image URL instead
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="url"
                      value={externalImageUrl}
                      onChange={(e) => setExternalImageUrl(e.target.value)}
                      className="input input-bordered bg-neutral-800 text-white w-full"
                      placeholder="Enter image URL"
                    />
                    {externalImageUrl && (
                      <div className="mt-4">
                        <Image
                          src={externalImageUrl}
                          alt="Preview"
                          className="h-40 object-cover rounded-md"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/300x200?text=Image+Not+Found";
                          }}
                        />
                      </div>
                    )}
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => {
                          setUseExternalImage(false);
                          setImage(null);
                          setImagePreview(null);
                        }}
                      >
                        Switch back to file upload
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Macros */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-neutral-700 pb-2">
                  Nutrition Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Calories*</span>
                    </label>
                    <input
                      type="number"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="input input-bordered bg-neutral-800 text-white w-full"
                      placeholder="kcal"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">
                        Protein (g)*
                      </span>
                    </label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="input input-bordered bg-neutral-800 text-white w-full"
                      placeholder="grams"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">
                        Carbohydrates (g)*
                      </span>
                    </label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="input input-bordered bg-neutral-800 text-white w-full"
                      placeholder="grams"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-white">Fat (g)*</span>
                    </label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      className="input input-bordered bg-neutral-800 text-white w-full"
                      placeholder="grams"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-neutral-700 pb-2">
                  Ingredients
                </h2>

                <div className="space-y-4">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-2 items-end bg-neutral-800/50 p-3 rounded-lg"
                    >
                      <div className="col-span-3 form-control">
                        <label className="label">
                          <span className="label-text text-white">
                            Ingredient
                          </span>
                        </label>
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) =>
                            updateIngredient(index, "name", e.target.value)
                          }
                          className="input input-bordered bg-neutral-800 text-white w-full"
                          placeholder="e.g. Chicken breast"
                          required
                        />
                      </div>

                      <div className="col-span-1 form-control">
                        <label className="label">
                          <span className="label-text text-white">
                            Quantity
                          </span>
                        </label>
                        <input
                          type="text"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            updateIngredient(index, "quantity", e.target.value)
                          }
                          className="input input-bordered bg-neutral-800 text-white w-full"
                          placeholder="200"
                          required
                        />
                      </div>

                      <div className="col-span-1 form-control">
                        <label className="label">
                          <span className="label-text text-white">Unit</span>
                        </label>
                        <select
                          value={ingredient.unit}
                          onChange={(e) =>
                            updateIngredient(index, "unit", e.target.value)
                          }
                          className="select select-bordered bg-neutral-800 text-white w-full"
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="l">l</option>
                          <option value="tsp">tsp</option>
                          <option value="tbsp">tbsp</option>
                          <option value="cup">cup</option>
                          <option value="oz">oz</option>
                          <option value="lb">lb</option>
                          <option value="piece">piece</option>
                          <option value="">none</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        <button
                          type="button"
                          className="btn btn-error btn-sm"
                          onClick={() => removeIngredient(index)}
                          disabled={ingredients.length <= 1}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline btn-secondary btn-sm"
                    onClick={addIngredient}
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Ingredient
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-neutral-700 pb-2">
                  Instructions
                </h2>

                <div className="space-y-4">
                  {instructions.map((step, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start bg-neutral-800/50 p-3 rounded-lg"
                    >
                      <div className="flex-shrink-0 font-bold text-white bg-primary w-6 h-6 flex items-center justify-center rounded-full">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <textarea
                          value={step}
                          onChange={(e) =>
                            updateInstruction(index, e.target.value)
                          }
                          className="textarea textarea-bordered bg-neutral-800 text-white w-full"
                          placeholder={`Step ${index + 1}...`}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-error btn-sm"
                        // Complete onClick handler for remove instruction button
                        onClick={() => removeInstruction(index)}
                        disabled={instructions.length <= 1}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addInstruction}
                    className="btn btn-outline btn-primary btn-sm"
                  >
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Step
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => router.push(`/meal/${mealId}`)}
                >
                  Return to Meal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || imageUploading}
                >
                  {isLoading || imageUploading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      {imageUploading
                        ? "Uploading Image..."
                        : "Updating Meal..."}
                    </>
                  ) : (
                    "Update Meal"
                  )}
                </button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditMeal;
