// import { createContext, useEffect, useState } from "react";
// import { api } from "../Instance/api";

// export const StoreContext = createContext(null);

// const StoreContextProvider = ({ children }) => {
//   const [currentStore, setCurrentStore] = useState(() => {
//     const savedStore = localStorage.getItem("currentStore");
//     return savedStore ? JSON.parse(savedStore) : null;
//   });

//   const [userStores, setUserStores] = useState([]);
//   const [isLoadingStores, setIsLoadingStores] = useState(true);

//   // Fetch user's stores
//   const fetchUserStores = async () => {
//     try {
//       setIsLoadingStores(true);
//       const response = await api.get("/stores/");
//       const stores = response.data.data || [];
//       setUserStores(stores);
      
//       // If no current store is set but user has stores, set the first one
//       if (!currentStore && stores.length > 0) {
//         setCurrentStore(stores[0]);
//       }
      
//       return stores;
//     } catch (error) {
//       console.error("Error fetching stores:", error);
//       setUserStores([]);
//       return [];
//     } finally {
//       setIsLoadingStores(false);
//     }
//   };

//   // Switch to a different store
//   const switchStore = (store) => {
//     setCurrentStore(store);
//     localStorage.setItem("currentStore", JSON.stringify(store));
//   };

//   // Clear store data (on logout)
//   const clearStoreData = () => {
//     setCurrentStore(null);
//     setUserStores([]);
//     localStorage.removeItem("currentStore");
//   };

//   // Add store-id header to all API requests
//   useEffect(() => {
//     if (currentStore?.id) {
//       api.defaults.headers.common['store-id'] = currentStore.id;
//     } else {
//       delete api.defaults.headers.common['store-id'];
//     }
//   }, [currentStore]);

//   // Keep localStorage in sync
//   useEffect(() => {
//     if (currentStore) {
//       localStorage.setItem("currentStore", JSON.stringify(currentStore));
//     } else {
//       localStorage.removeItem("currentStore");
//     }
//   }, [currentStore]);

//   // Check if user has access to any stores
//   const hasStores = userStores.length > 0;
  
//   // Check if user is owner of current store
//   const isStoreOwner = currentStore?.ownerId === JSON.parse(localStorage.getItem("user") || "{}")?.id;

//   return (
//     <StoreContext.Provider value={{
//       currentStore,
//       setCurrentStore,
//       userStores,
//       setUserStores,
//       isLoadingStores,
//       fetchUserStores,
//       switchStore,
//       clearStoreData,
//       hasStores,
//       isStoreOwner
//     }}>
//       {children}
//     </StoreContext.Provider>
//   );
// };

// export default StoreContextProvider;

import { createContext, useEffect, useState } from "react";
import { api } from "../Instance/api";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [currentStore, setCurrentStore] = useState(() => {
    try {
      const savedStore = localStorage.getItem("currentStore");
      return savedStore ? JSON.parse(savedStore) : null;
    } catch (error) {
      console.error("Error parsing saved store:", error);
      return null;
    }
  });

  const [userStores, setUserStores] = useState([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  // Fetch user's stores
  const fetchUserStores = async () => {
    try {
      setIsLoadingStores(true);
      const response = await api.get("stores/");
      const stores = response.data.data || [];
      setUserStores(stores);
      
      // If no current store is set but user has stores, set the first one
      if (!currentStore && stores.length > 0) {
        setCurrentStore(stores[0]);
      }
      
      return stores;
    } catch (error) {
      console.error("Error fetching stores:", error);
      setUserStores([]);
      return [];
    } finally {
      setIsLoadingStores(false);
    }
  };

  // Switch to a different store
  const switchStore = (store) => {
    setCurrentStore(store);
    if (store) {
      localStorage.setItem("currentStore", JSON.stringify(store));
    } else {
      localStorage.removeItem("currentStore");
    }
  };

  // Clear store data (on logout)
  const clearStoreData = () => {
    setCurrentStore(null);
    setUserStores([]);
    localStorage.removeItem("currentStore");
  };

  // Add store-id header to all API requests
  useEffect(() => {
    if (currentStore?.id) {
      api.defaults.headers.common['store-id'] = currentStore.id;
    } else {
      delete api.defaults.headers.common['store-id'];
    }
  }, [currentStore]);

  // Check if user has access to any stores
  const hasStores = userStores.length > 0;
  
  // Check if user is owner of current store
  const isStoreOwner = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return currentStore?.ownerId === user?.id;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return false;
    }
  })();

  // Create the context value object
  const contextValue = {
    currentStore,
    setCurrentStore,
    userStores,
    setUserStores,
    isLoadingStores,
    fetchUserStores,
    switchStore,
    clearStoreData,
    hasStores,
    isStoreOwner
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;