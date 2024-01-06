import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SelectDropdown from "react-native-select-dropdown";
import SyncStorage from 'sync-storage';

export default function Home() {
  const navigation = useNavigation();
  const [departmentNames, setDepartmentNames] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl =
        "http://124.43.17.223:8020/ITRACK/api/services/app/department/GetDepartmentNames";

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

        const names = data.result.items.map((item) => item.name);

        setDepartmentNames(names);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleScanButtonPress = () => {
    if (selectedDepartment) {
      navigation.navigate("Scanner");
    } else {
      Alert.alert("Warning", "Please select a department to scan.");
    }
  };

  return (
      <View style={styles.container}>
      <Text style={styles.title}>Select Department</Text>
      <View style={styles.dropdownContainer}>
        <SelectDropdown
          style={styles.input}
          data={departmentNames}
          onSelect={(selectedItem, index) => {
            setSelectedDepartment(selectedItem);
            SyncStorage.set('department', selectedItem)
          }}
          buttonTextAfterSelection={(selectedItem, index) => selectedItem}
          rowTextForSelection={(item, index) => item}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, { height: 50, borderRadius: 10 }]} // Adjust the height and border radius as needed
        disabled={!selectedDepartment}
        onPress={() => handleScanButtonPress()}
      >
        <Text style={styles.buttonText}>Scan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    width: "100%",
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  button: {
    height: 40, 
    width: "80%",
    backgroundColor: "#007BFF", 
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff", 
    fontSize: 16,
    fontWeight: "bold",
  },
});
