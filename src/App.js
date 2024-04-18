import { app } from "./firebase";
import { useEffect, useRef, useState } from "react";
import Message from "./Components/Message";
import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import {signOut,onAuthStateChanged,GoogleAuthProvider,getAuth,signInWithPopup} from 'firebase/auth';
import {getFirestore,addDoc, collection, serverTimestamp,onSnapshot,query,orderBy} from 'firebase/firestore';
const auth=getAuth(app);
const db=getFirestore(app);
const loginHandler=()=>{
  const provider=new GoogleAuthProvider();
  signInWithPopup(auth,provider);
}
const logoutHandler=()=>{
  signOut(auth);
}
function App() {
  const [user,setUser]=useState(false);
  const [message,setMessage]=useState("");
  const [messages,setMessages]=useState([]);
  const divForScroll=useRef(null);
  const submitHandler=async(e)=>{
    e.preventDefault();
    try {
      setMessage("");
      await addDoc(collection(db,"Messages"),{
        // text:"adsdfs",
        text:message,
        uid:user.uid,
        uri:user.photoURL,
        createdAt:serverTimestamp()
      });
      // setMessage("");
      divForScroll.current.scrollIntoView({behavior:"smooth"});
    } catch (error) {
      alert(error);
    }
  }
  useEffect(()=>{
  const q=query(collection(db,"Messages"),orderBy("createdAt","asc"));
    const unsubscribe=onAuthStateChanged(auth,(data)=>{
      // console.log(data);
      setUser(data);
    });
    // const unsubscribeMessage= onSnapshot(collection(db,"Messages"),(snap)=>{
    const unsubscribeMessage= onSnapshot(q,(snap)=>{
      // console.log(snap);
      // console.log(snap.docs);
      // console.log(snap.docs.map((item)=>{
      setMessages(snap.docs.map((item)=>{
        const id=item.id;
        return(
          // item.id
          // item.data()
          // id
          {
            id,...item.data()
          }
        )
      }));
    });
    return ()=>{
      unsubscribe();
      unsubscribeMessage();
    }
  },[])
  return (
    <Box bg={"red.50"}>
    {user?
      <Container bg={"white"} h={"100vh"}>
        <VStack h={"full"} padding={"2"}>
          <Button width={"100%"} colorScheme={"red"} onClick={logoutHandler}>
            Logout
          </Button>
          <VStack
            overflowY={"auto"}
            // bg={"purple.100"}
            h="full"  
            width={"full"}
            css={{"&::-webkit-scrollbar":{
              display:"none"
            }}}
          >
          {messages.map((item,index,arr)=>{
            return(
            <Message key={item.id} text={item.text} uri={item.uri} user={item.uid===user.uid?"me":"other"}></Message>
            )
          })}
          {/* <Message key={index} text={message} user={"me"}></Message> */}
          <div ref={divForScroll}></div>
          </VStack>
          <form style={{ width: "100%" }} onSubmit={submitHandler}>
            <HStack>
              <Input placeholder="Enter a Message..." value={message} onChange={(e)=>{setMessage(e.target.value)}}></Input>
              <Button colorScheme="purple" type="submit">
                Send
              </Button>
            </HStack>
          </form>
        </VStack>
      </Container>
      :<VStack bg={"white"} h={"100vh"} justifyContent={"center"}>
        <Button colorScheme={"purple"} onClick={loginHandler}>Sign In With Google</Button>
      </VStack>}
    </Box>
  );
}
export default App;