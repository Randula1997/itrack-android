import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import SelectDropdown from "react-native-select-dropdown";
import SyncStorage from "sync-storage";

export default function Login() {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [factoryCode, setFactoryCode] = useState("");
  const [facotoryNames, setFactoryNames] = useState([]);
  const [ids, setIds] = useState([]);

  const handleLogin = async () => {
    const apiUrl = "http://124.43.17.223:8020/itrack/account/login"; // Replace with your actual API endpoint

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmailAddress: username,
          password,
          tenancyName: factoryCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      navigation.navigate("Home");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchFactoryCodes = async () => {
      const apiUrl =
        "http://124.43.17.223:8020/ITRACK/api/services/app/department/GetTenants";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Data not Available");
        }

        const data = await response.json();

        const facotoryNames = data.result.items.map((item) => item.tenancyName);
        const tenantIds = data.result.items.map((item) => item.id);
        setFactoryNames(facotoryNames);
        setIds(tenantIds);
      } catch (error) {
        console.error(error);
      }
    };
    fetchFactoryCodes();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputWrapper}>
        <SelectDropdown
          style={styles.dropdown}
          data={facotoryNames}
          defaultButtonText="Select Location"
          onSelect={(selectedItem, index) => {
            const idIndex = facotoryNames.findIndex((x) => x === selectedItem);
            setFactoryCode(selectedItem);
            SyncStorage.set("factoryCode", selectedItem);
            SyncStorage.set("tenantId", ids[idIndex]);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem;
           }}
          rowTextForSelection={(item, index) => {
            return item;
          }}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputWrapper: {
    width: '80%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    overflow: 'hidden', // Ensure the border radius is applied
  },
  dropdown: {
    height: 40,
    paddingLeft: 10,
    paddingRight: 20, // Adjust as needed
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
