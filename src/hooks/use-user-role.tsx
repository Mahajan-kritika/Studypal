
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Role = 'Student';

export interface UserProfile {
  role: Role;
  name: string;
  email: string;
  avatar: string | undefined;
  id: string;
  class: string;
  field: string;
  institution: string;
}

interface UserContextType {
  user: UserProfile;
  updateUser: (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>) => void;
  loadUserByEmail: (email: string) => void;
  resetUser: () => void;
  userName: string;
  userEmail: string;
  userAvatar: string | undefined;
  userId: string;
  userClass: string;
  userField: string;
  userInstitution: string;
  setUserAvatar: (avatar: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: UserProfile = {
    role: 'Student',
    name: 'Alex Johnson',
    avatar: `https://i.pravatar.cc/150?u=alex-johnson`,
    email: 'alex@example.com',
    id: 'alex-johnson',
    class: '10th Grade',
    field: '',
    institution: 'State University',
};

const getMockUserDatabase = () => {
    if (typeof window === 'undefined') {
      return { 'alex@example.com': defaultUser };
    }
  
    const storedDb = localStorage.getItem('mockUserDatabase');
    if (storedDb) {
      try {
        return JSON.parse(storedDb);
      } catch (e) {
        return { 'alex@example.com': defaultUser };
      }
    }
    return { 'alex@example.com': defaultUser };
};

const saveMockUserDatabase = (db: { [email: string]: UserProfile }) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockUserDatabase', JSON.stringify(db));
    }
};
  

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem('currentUser');
      if (item) {
        const storedUser = JSON.parse(item);
        if (storedUser && storedUser.email) {
            setUser(storedUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse currentUser from localStorage", error);
      setUser(defaultUser);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (error) {
        console.error("Failed to save currentUser to localStorage", error);
      }
    }
  }, [user, isMounted]);

  const updateUser = (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'role'>>) => {
    setUser(prevUser => {
        const newUser = { ...prevUser, ...updates };
        const db = getMockUserDatabase();
        db[newUser.email] = newUser;
        saveMockUserDatabase(db);
        return newUser;
    });
  };

  const loadUserByEmail = (email: string) => {
    const db = getMockUserDatabase();
    const foundUser = db[email.toLowerCase()];
    if (foundUser) {
        setUser(foundUser);
    } else {
        // Fallback, though login/signup flow should prevent this.
        setUser(defaultUser);
    }
  }

  const resetUser = () => {
    localStorage.removeItem(`userProfile_${user.id}`);
    localStorage.removeItem('currentUser');
    const db = getMockUserDatabase();
    delete db[user.email];
    saveMockUserDatabase(db);
  }

  const setUserAvatar = (avatar: string) => {
      updateUser({ avatar });
  }

  const value: UserContextType = {
    user,
    updateUser,
    loadUserByEmail,
    resetUser,
    userName: user.name,
    userEmail: user.email,
    userAvatar: user.avatar,
    userId: user.id,
    userClass: user.class,
    userField: user.field,
    userInstitution: user.institution,
    setUserAvatar,
  };
  
  if (!isMounted) {
    const defaultContext: UserContextType = {
        user: defaultUser,
        updateUser: () => {},
        loadUserByEmail: () => {},
        resetUser: () => {},
        userName: defaultUser.name,
        userEmail: defaultUser.email,
        userAvatar: defaultUser.avatar,
        userId: defaultUser.id,
        userClass: defaultUser.class,
        userField: defaultUser.field,
        userInstitution: defaultUser.institution,
        setUserAvatar: () => {},
    };
    return (
        <UserContext.Provider value={defaultContext}>
            {children}
        </UserContext.Provider>
    )
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
