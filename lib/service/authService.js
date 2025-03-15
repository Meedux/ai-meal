import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Register a new user
export const registerUser = async (email, password, name) => {
    try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Generate a placeholder profile image URL based on user's name
    const placeholderImage = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0369a1`;
    
    // Set up the user document in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: name,
      email: email,
      image: placeholderImage,
      preferences: {
        diet: 'none',
        allergies: [],
        cuisines: []
      },
      target_macros: {
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 70
      },
      setupCompleted: false,
      createdAt: new Date()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
  };

// Login an existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Logout the current user
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};