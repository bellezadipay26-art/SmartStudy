import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ add

const firebaseConfig = {
 apiKey: "AIzaSyCtWW76Ahp0g9VX6YXPoqPBR3pvJXRhi1o",
  authDomain: "smartstudy-26522.firebaseapp.com",
  projectId: "smartstudy-26522",
  storageBucket: "smartstudy-26522.firebasestorage.app",
  messagingSenderId: "819508303709",
  appId: "1:819508303709:web:32b15cdb3c078423163ab4",
  measurementId: "G-9VYDQE06CX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
const analytics = getAnalytics(app);

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      authProvider: "local",
      email: email,
      name: "",
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const fetchUserDetails = async (uid) => {
  try {
    console.log(uid);
    const usersRef = collection(db, "user_information");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0]; // Assuming 'uid' is unique and only returns one result
      return userDoc.data();
    } else {
      console.log("No user found with UID:", uid);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

const updateUserDetails = async (uid, userDetails) => {
  try {
    // Query to find the user document based on the uid field
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming uid is unique and only returns one result
      const userDocRef = querySnapshot.docs[0].ref;
      await updateDoc(userDocRef, userDetails);
      console.log("User details updated successfully");
    } else {
      console.log("No user found with UID:", uid);
    }
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};
const deleteUserDetails = async (uid) => {
  try {
    // same query logic as updateUserDetails
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // delete ALL matching docs (safe)
      const deletePromises = querySnapshot.docs.map((docSnap) =>
        deleteDoc(docSnap.ref)
      );
      await Promise.all(deletePromises);

      console.log("User details deleted successfully");
    } else {
      console.log("No user found with UID:", uid);
    }
  } catch (error) {
    console.error("Error deleting user details:", error);
    throw error;
  }
};

const logout = () => {
  signOut(auth);
};

export {
  auth,
  db,
  app,
  storage,
  analytics,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  fetchUserDetails,
  updateUserDetails,
  deleteUserDetails,
};
