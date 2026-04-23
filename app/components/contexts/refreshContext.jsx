//context (shared state) for refreshing add page (stations, fdra, dispatch) after each change
//all components regarding adding/changing/deleting will cause the refresh value to change re rendering all useRefresh components
'use client';
import { createContext, useState, useContext, useCallback } from 'react';

//create shared state
const RefreshContext = createContext();

//provider to wrap add page components
export const RefreshProvider = ({ children }) => { //any child can use
    const [refreshFlag, setRefreshFlag] = useState(0); //count up for each refresh

    console.log('RefreshProvider rendered, current refreshFlag:', refreshFlag);
    const triggerRefresh = useCallback(() => { //stable funcitons to not re render of children(ex:stationAddForm)
        setRefreshFlag(prev => prev + 1); //increment counter for each user input, prevents unesesary and can store multiple instances of refresh needed(if multiple adds quickly)
    }, []);
    

    //children will be add forms, provide this to them
    return (
        <RefreshContext.Provider value={{ refreshFlag, triggerRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
}
//hook to use context in any component
export function useRefresh() {
    //get context value, which includes refreshFlag and triggerRefresh function
    const context = useContext(RefreshContext);
    if (!context) {
        throw new Error('useRefresh must be used within a RefreshProvider');
    }
    return context;
}