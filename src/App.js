import logo from './logo.svg';
import './App.css';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [servers, setServers] = useState([])
  const [serverId, setServerId] = useState(0)
  const [messages, setMessages] = useState([])
  const [user, setUser] = useState({})
  const [loginScreen, setLoginState] = useState(false)

  const sendMessageRef = useRef();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  };

  useEffect(()=>{
    axios.get("http://localhost:8000/api/ext/servers")
    .then((response)=>{
    setServers(response.data)
    setServerId(response.data[0].id)
    })
    .catch((error)=>{ console.log("Server Error: ", error)})
  }, [])

  useEffect(()=>{
    if(serverId != 0){
      getMessages()
    }
  }, [serverId])

  useEffect(() => {
    if (serverId !== 0) {
      getMessages(); // Call it initially
      const intervalId = setInterval(getMessages, 3000); // Call it every 3 seconds

      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [serverId]);

  const getMessages = () =>{
    axios.get(`http://localhost:8000/api/ext/messages/${serverId}`)
    .then((response) => {
      setMessages(response.data)
      scrollToBottom()
     })
    .catch((error) => { console.log("Error Loading Messages: ", error)} )
  }

  const sendMessage = () =>{
    axios.post('http://localhost:8000/api/ext/message',
    {
      "content" : document.getElementById('usermessage').value,
      "sender_name" : user.name,
      "server_id" : serverId
    })
    .then((response)=>{
      getMessages()
      document.getElementById('usermessage').value="";
      sendMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    })
    .catch((error)=>{
      console.log(error)
    })

  }

  const login = () =>{
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;
    axios.post('http://localhost:8000/api/ext/user/login',
    {
      "email" : email,
      "password" : password
    })
    .then((response)=>{
      console.log(response)
      setUser(response.data.user)
      console.log("Log in successful")
      setLoginState(false)
    })
    .catch((error)=>{ console.log("Error Logging In: ", error)})
  }

  const signout = () =>{
    setUser({})
  }

  return (
  <div className='Body'>
    <div>
    <div>
          <div className='Header'>
              <h1>Welcome to Disrope</h1>
              {
                user && user.id ? 
                <button className='BubbleButton' onClick={()=>{
                  signout()
                }}>Logout</button>
                :
                <button className='BubbleButton' onClick={()=>{
                  setLoginState(true)
                }}>Login</button>
              }
              
              
          </div>

          <div>
            <h4>Select a server and happy messaging!</h4>
          </div>
    </div>


    <div className='DashboardBody'>
        <div>
        <p>Server List</p>
          <div>
            { 
              servers.length > 0 ? servers.map((server)=>{
                return(
                  <p key={server.id} onClick={()=>{
                    setServerId(server.id)
                  }}>{server.name}</p>
                )
              })
              :
              <p>Loading...</p>
            }
          </div>
        </div>
        <div>
            <div className='messageContainer' id='messageContainer'>
                { 
                  messages.map((message)=>{
                    return(
                      <p key={message.id}>{message.sender_name} : {message.content}</p>
                    )
                  })
                }
              {
                user && user.id ?
                <div className="messageInputContainer">
                  <input
                    type="text"
                    id="usermessage"
                    name="usermessage"
                    placeholder="What's on your mind?"
                    ref={sendMessageRef}
                  />
                  <button onClick={sendMessage}>Submit</button>
                </div>
                :
                <p>You must be logged in to send messages!</p>
              }
            </div>
                    
        </div>

    </div>
        
    <h4>Disrope officials will never ask for your password!</h4>

    {
      !user.id && loginScreen ?
      <div className='LoginScreen'>
        <div className='loginContainer'>
          <h2>Login</h2>
          <form>
            <input placeholder='Email' id="loginEmail" /><br/>
            <input placeholder='Password' id="loginPassword" /><br/>
            <button type='button' onClick={login}>Login</button>
            <button onClick={()=>{
              setLoginState(false)
            }}>Cancel</button>
          </form>
        </div>
      </div>
      :
      <></>
    }
    </div>
  </div>
  );
}

export default App;
