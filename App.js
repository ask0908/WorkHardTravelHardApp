import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Fontisto } from "@expo/vector-icons";
import { theme } from "./Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [loading, setLoading] = useState(true);
  // 사용자가 Work 탭을 보고 있는지 확인할 state
  const [working, setWorking] = useState(true);
  // 사용자의 입력값을 감지할 때 사용할 state
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  // loadToDos() 실행을 위해 useEffect()를 사용한다
  useEffect(() => {
    loadToDos();
  }, []);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s !== null) {
        setToDos(JSON.parse(s));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // toDos를 String으로 바꾸고 저장하는 함수
  const saveToDos = async (toSave) => {
    // setItem()은 Promise를 리턴한다
    // Key는 @toDos, Value는 JSON으로 바뀐 toDo다
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    // 3개의 객체 결합(Object.assign())
    // 1번 인자 : 빈 객체, 2번 인자 : 이전 todo, 3번 인자 : 대상 객체
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  // toDo 삭제
  const deleteToDo = (id) => {
    Alert.alert("ToDo를 삭제하시겠습니까?", "ㄹㅇ?", [
      { text: "취소" },
      {
        text: "확인",
        style: "destructive",
        onPress: async () => {
          /* 여기서 로딩 프로그레스 바 보여줘도 될 거 같은데??? */
          // newToDos가 이전 toDos라고 알려주는 처리가 필요하다
          // 빈 객체 ({})를 만들고 그 안에 toDos 내용들을 넣는다
          const newToDos = { ...toDos };
          // 그 후 delete 키워드를 써서 newToDos 안의 Key를 지운다. 여기서 Key는 밀리초 형태의 오늘 날짜다
          delete newToDos[id];
          // 데이터 변동이 일어났으니 state를 업데이트시킴
          setToDos(newToDos);
          // 그 행동을 LocalStorage에 저장
          await saveToDos(newToDos);
        },
      },
    ]);
    return;
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
        style={styles.input}
      />
      <ScrollView>
        {/* todo 안의 key(id)들을 보고 있다. 그리고 유저가 입력한 toDos[key].text를 표시한다 */}
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name="trash" size={18} color={theme.gray} />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 44,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.gray,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
