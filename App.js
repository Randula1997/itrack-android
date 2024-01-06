import React from "react";
import * as SQLite from 'expo-sqlite';

import Scanner from "./screens/Scanner";
import Home from "./screens/Home";
import Login from "./screens/Login";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Dashboard from "./screens/Dashboard";

const Stack = createStackNavigator();


function App() {

  const db = SQLite.openDatabase('machineDb')
  return(
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
      <Stack.Screen name="Scanner" component={Scanner} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
      {/* <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }}/> */}
    </Stack.Navigator>
  )
}

export default () => {
  return (
    <NavigationContainer>
      <App/>
    </NavigationContainer>
  )
}