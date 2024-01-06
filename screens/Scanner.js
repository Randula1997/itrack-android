import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Button,
  Linking,
  Vibration,
  TouchableOpacity,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { storeData, getData, clearData } from "../database/storageService";
import SyncStorage from "sync-storage";
import { ScrollView } from "react-native";

export default function Scanner() {
  const factoryCode = SyncStorage.get("factoryCode");
  const tenantId = SyncStorage.get("tenantId");
  const selectedDepartment = SyncStorage.get("department");

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [lastScannedNumber, setLastScannedNumber] = useState("");
  const [selectedButton, setSelectedButton] = useState("Usable");
  const [scannedItems, setScannedItems] = useState([]);
  const [tableData, setTableData] = useState([]);

  const Table = ({ data }) => (
    <ScrollView style={{ height: 200 }}>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Asset No</Text>
          <Text style={styles.headerCell}>Dep</Text>
          <Text style={styles.headerCell}>Status</Text>
        </View>
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.assetNo}</Text>
            <Text style={styles.tableCell}>{item.departmentName}</Text>
            <Text style={[styles.tableCell, { color: item.condition === 'Defected' ? 'red' : 'black' }]}>{item.condition}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const fetchScannedItems = async () => {
    const storedItems = await getData();
    setTableData(storedItems);
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
    fetchScannedItems();
  }, []);

  const handleUploadAll = () => {
    const uploadData = async () => {
      const apiUrl =
        "http://124.43.17.223:8020/ITRACK/api/services/app/dailyAssetVerification/UploadBulk";
      const payload = {
        scans: tableData,
      };
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          clearData();
          alert("data Uploaded")
        } else {
          console.error("Upload failed:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    uploadData();
  };

  const handleBarCodeScanned = ({ type, data }) => {
    const machineNumbers = tableData.map((item) => item.assetNo);
    if (!machineNumbers.includes(data)) {
      setScanned(true);
      Vibration.vibrate();
      setLastScannedNumber(data);
      const scannedItem = {
        tenantId: tenantId,
        factoryCode: factoryCode,
        assetNo: data,
        departmentName: selectedDepartment,
        date: new Date(),
        condition: selectedButton,
      };
      setScannedItems((prevScannedItems) => [...prevScannedItems, scannedItem]);
      storeData(scannedItem);
    }
    else{
      setScanned(false);
      alert(`Already Scanned: ${data} `)
    }
  };

  useEffect(() => {
    fetchScannedItems();
  }, [tableData]);

  if (hasPermission === null) {
    return <Text>Requesting for Camera Permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No Access to Camera</Text>;
  }

  const handleButtonPress = (buttonName) => {
    setSelectedButton(buttonName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.totalCount}>
        {tableData.length.toString().padStart(3, "0")}
      </Text>
      <View style={styles.countContainer}>
        <Text style={styles.count}>
          UM |{" "}
          {tableData
            .filter((item) => item.condition === "Usable")
            .length.toString()
            .padStart(2, "0")}
        </Text>
        <Text style={styles.count}>
          DM |{" "}
          {tableData
            .filter((item) => item.condition === "Defected")
            .length.toString()
            .padStart(2, "0")}
        </Text>
      </View>
      <View style={styles.cameraContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
      </View>
      {scanned && (
        <TouchableOpacity
        style={[styles.scanAgainButton, { height: 50, borderRadius: 10 }]} // Adjust the height and border radius as needed
        disabled={!selectedDepartment}
        onPress={() => setScanned(false)}
      >
        <Text style={styles.buttonText}>Tap to Scan Again</Text>
      </TouchableOpacity>
        // <Button title="Tap to Scan Again" onPress={() => setScanned(false)} style={{height: 40}}/>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Usable"
          onPress={() => handleButtonPress("Usable")}
          color={selectedButton === "Usable" ? "green" : "#848482"}
          style={styles.button}
        />
        <Button
          title="Defected"
          onPress={() => handleButtonPress("Defected")}
          color={selectedButton === "Defected" ? "red" : "#848482"}
          style={styles.button}
        />
      </View>
      <Text style={styles.lastScannedNumber}>
        Last scanned Asset No : {lastScannedNumber}
      </Text>
      <Table data={tableData} />
      <Button
        onPress={() => handleUploadAll()}
        title="Upload All"
        color="blue"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around", 
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  button: {
    marginHorizontal: 10, 
    minWidth: 150,
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 10,
    paddingBottom: 10
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    backgroundColor: "#B9D9EB",
    padding: 10,
    marginRight: 30,
    marginLeft: 30,
  },
  totalCount: {
    fontSize: 60,
    textAlign: "center",
    color: "blue",
    marginTop: 30,
  },
  count: {
    fontSize: 20,
  },
  cameraContainer: {
    aspectRatio: 1,
    width: "70%",
    alignSelf: "center",
    marginBottom: 20
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  lastScannedNumber: {
    marginLeft: 20,
    marginRight: 20,
  },
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 20,
    marginLeft: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  headerCell: {
    flex: 1,
    padding: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: "center",
  },
  scanAgainButton: {
    height: 40, 
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
