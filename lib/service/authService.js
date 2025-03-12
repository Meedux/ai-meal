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
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create a user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        setupCompleted: false,  // Add setup flag
        preferences: {
          diet: null,
          allergies: [],
          cuisines: []
        },
        lastMacroDate: null,  // Track the last date macros were set
        target_macros: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
        // taken_macros will be a subcollection, not a field
      });
      
      return userCredential.user;
    } catch (error) {
      console.error("Error registering user:", error);
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