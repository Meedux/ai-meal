"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { createRecipe } from "@/lib/service/meal";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import Card from "./util/Card";

const CreateMeal = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);

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

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Redirect to login if not authenticated
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storageRef = ref(storage, `meal-images/${userId}/${Date.now()}_${safeFileName}`);
      
      // Add metadata to help with CORS issues
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'uploaded-by': userId || 'anonymous'
        }
      };
      
      // Upload with metadata
      await uploadBytes(storageRef, file, metadata);
      return getDownloadURL(storageRef);
    } catch (error) {
      console.error("Image upload failed:", error);
      
      // If it's likely a CORS error, provide better feedback
      if (error.code === 'storage/unauthorized' || error.message.includes('CORS')) {
        throw new Error("Image upload failed due to permission settings. Try a smaller image or a different file format.");
      }
      
      throw error;
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("You must be logged in to create a meal");
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
        isPublic: true,
        createdAt: new Date(),
      };

      // Get image - either from upload or external URL
      if (useExternalImage && externalImageUrl) {
        recipeData.image = externalImageUrl;
      } else if (image) {
        try {
          const imageUrl = await uploadImage(image);
          recipeData.image = imageUrl;
        } catch (imageError) {
          console.error(
            "Image upload failed, continuing without image:",
            imageError
          );
          // Continue without image rather than failing the whole submission
        }
      }

      // Save recipe to Firestore
      const newRecipe = await createRecipe(userId, recipeData);

      setSuccess(true);

      // Redirect after successful creation
      setTimeout(() => {
        router.push(`/meal/${newRecipe.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error creating meal:", error);
      setError(error.message || "Failed to create meal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6">
              Create New Meal
            </h1>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-500 text-green-200 p-4 rounded-lg mb-6">
                Meal created successfully! Redirecting...
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      placeholder="Prep time"
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
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-48 w-auto object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="mt-2">
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => setUseExternalImage(true)}
                        >
                          Or use an image URL instead
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
                        placeholder="https://example.com/image.jpg"
                      />
                      {externalImageUrl && (
                        <div className="mt-4">
                          <img
                            src={externalImageUrl}
                            alt="Preview"
                            className="h-48 w-auto object-cover rounded-lg"
                            onError={(e) => (e.target.style.display = "none")}
                          />
                        </div>
                      )}
                      <div className="mt-2">
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => {
                            setUseExternalImage(false);
                            setExternalImageUrl("");
                          }}
                        >
                          Switch back to file upload
                        </button>
                      </div>
                    </>
                  )}
                </div>
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

                {ingredients.map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 items-end">
                    <div className="col-span-3 sm:col-span-3">
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
                        placeholder="Ingredient name"
                        required
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="label">
                        <span className="label-text text-white">Amount</span>
                      </label>
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(index, "quantity", e.target.value)
                        }
                        className="input input-bordered bg-neutral-800 text-white w-full"
                        placeholder="Amount"
                        required
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
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
                        <option value="piece">piece</option>
                        <option value="">none</option>
                      </select>
                    </div>

                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="btn btn-square btn-sm btn-outline btn-error"
                        disabled={ingredients.length === 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addIngredient}
                  className="btn btn-outline btn-primary btn-sm"
                >
                  Add Ingredient
                </button>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white border-b border-neutral-700 pb-2">
                  Instructions
                </h2>

                {instructions.map((step, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 flex items-center justify-center bg-primary rounded-full w-8 h-8 mt-2 text-white font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-grow">
                      <textarea
                        value={step}
                        onChange={(e) =>
                          updateInstruction(index, e.target.value)
                        }
                        className="textarea textarea-bordered bg-neutral-800 text-white w-full"
                        placeholder={`Step ${index + 1}`}
                        rows={2}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="btn btn-square btn-sm btn-outline btn-error mt-2"
                      disabled={instructions.length === 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
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
                  Add Step
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Meal"
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

export default CreateMeal;
