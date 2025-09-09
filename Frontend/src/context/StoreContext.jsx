import { createContext, useEffect, useState, useContext } from "react";
import { api } from "../Instance/api";
import { UserContext } from "./UserContext"; 

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const { user } = useContext(UserContext);

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
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const fetchUserStores = async () => {
    try {
      setIsLoadingStores(true);
      const response = await api.get("stores/");
      const stores = response.data.data || [];
      setUserStores(stores);
      return stores;
    } catch (error) {
      console.error("Error fetching stores:", error);
      setUserStores([]);
      return [];
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserStores();
    } else {
      setUserStores([]);
      setCurrentStore(null);
      localStorage.removeItem("currentStore");
    }
  }, [user]);

  useEffect(() => {
    if (!currentStore && userStores.length > 0 && !isLoadingStores) {
      const firstStore = userStores[0];
      setCurrentStore(firstStore);
      localStorage.setItem("currentStore", JSON.stringify(firstStore));
    }
  }, [currentStore, userStores, isLoadingStores]);

  const switchStore = (store) => {
    setCurrentStore(store);
    if (store) {
      localStorage.setItem("currentStore", JSON.stringify(store));
    } else {
      localStorage.removeItem("currentStore");
    }
  };

  const clearStoreData = () => {
    setCurrentStore(null);
    setUserStores([]);
    localStorage.removeItem("currentStore");
  };

  useEffect(() => {
    if (currentStore?.id) {
      api.defaults.headers.common["store-id"] = currentStore.id;
    } else {
      delete api.defaults.headers.common["store-id"];
    }
  }, [currentStore]);

  // Check if user has access to any stores
  const hasStores = userStores.length > 0;

  // Check if user is owner of current store
  const isStoreOwner = (() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      return currentStore?.ownerId === userData?.id;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return false;
    }
  })();

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
    isStoreOwner,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
