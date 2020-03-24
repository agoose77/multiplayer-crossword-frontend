import React, {useState, useEffect, getState, useRef} from 'react';
import Dialog from 'react-bootstrap-dialog'
import axios from 'axios';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useParams
} from "react-router-dom";
import Crossword from '@guardian/react-crossword';
import {ListGroup, Nav, Navbar, Form, Container, Row, Col, CloseButton, InputGroup, FormControl, Button} from "react-bootstrap";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const ws = new WebSocket("ws://localhost:5000/ws");


function Sessions(props) {
    const sessions = props.sessions;
    return (
        <ListGroup>{sessions.map((session) => (
            <ListGroup.Item key={session.id} action href={`/play/${session.id}`}>{session.name} <CloseButton
                onClick={
                    (e) => {
                        e.preventDefault();
                        props.onDelete(session.id)
                    }}></CloseButton></ListGroup.Item>
        ))}
        </ListGroup>
    );
}

function Home() {
    const [sessions, setSessions] = useState([]);
    const formRef = useRef(null);
    const dialogueRef = useRef(null);

    async function loadSessions() {
        const response_sessions = await fetch('/sessions', {'method': 'GET'});
        setSessions(await response_sessions.json());
    }

    useEffect(() => {
        loadSessions();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(formRef.current);
        const response_create = await fetch("/sessions", {
            'method': 'POST',
            body: data
        });
        await loadSessions();
    }

    // On delete an existing session
    async function onCloseSession(session_id) {
        dialogueRef.current.show({
            title: 'Delete session?',
            body: 'Deleting this session will end the game!',
            actions: [
                Dialog.CancelAction(),
                Dialog.OKAction(async () => {
                    await fetch(`/sessions/${session_id}`, {'method': 'DELETE'});
                    await loadSessions();
                })
            ],
            bsSize: 'small',
        });
    }

    return (
        <Container fluid>
            <Dialog ref={dialogueRef}/>
            <Row><Col md><Sessions sessions={sessions} onDelete={onCloseSession}/></Col></Row>
            <Row><Col md>
                <Form onSubmit={handleSubmit} ref={formRef}>
                    <InputGroup>
                        <FormControl
                            placeholder="My Game"
                            aria-label="Session Name"
                            aria-describedby="session-name"
                            type="text"
                            name="name"
                            id="name"
                        />
                        <FormControl
                            placeholder="Guardian Crossword Number"
                            aria-label="Crossword Number"
                            aria-describedby="cross-no"
                            type="number"
                            name="crossword"
                            id="crossword"
                        />
                        <InputGroup.Append>
                            <Button type="submit">New Game</Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form></Col>
            </Row>
        </Container>
    );
}

function PlaySession() {
    let {id} = useParams();
    const [board, setBoard] = useState(null);
    const [initialMoves, setInitialMoves] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const crosswordRef = useRef(null);

    async function connectWS() {
        console.log("OnConnect");
        // websocket onopen event listener
        ws.onopen = () => {
            console.log("connected websocket main component");
        };
        ws.onmessage = (event) => {
            const move = JSON.parse(event.data);
            let {x, y, value, ...rest} = move;
            console.log(["Received", x, y, value, crosswordRef.current]);
            crosswordRef.current.setCellValue(x, y, value, false);
        };
        // websocket onclose event listener
        ws.onclose = e => {
            console.log(
                'Socket is closed',
                e.reason
            );
        };

        // websocket onerror event listener
        ws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            ws.close();
        };

        let payload = {
            'type': 'subscribe',
            'content': {
                'id': id
            }
        };
        ws.send(JSON.stringify(payload))
    }

    async function loadBoard() {
        const responseSession = await fetch(`/sessions/${id}`, {'method': 'GET'});
        const data = await responseSession.json();
        setBoard(data['board']);
        setInitialMoves(data['moves']);
        setIsLoaded(true);
        await connectWS();
    }

    function onMove(move) {
        let payload = {
            'type': 'move',
            'content': {
                'id': id,
                'move': move
            }
        };
        ws.send(JSON.stringify(payload))
    }

    useEffect(() => {
        loadBoard();
    }, []);



    if (isLoaded) {
        console.log(board);
        return <Crossword data={board} ref={crosswordRef} saveGrid={(id, grid) => {}} onMove={onMove}/>;
    }
    return <div>Loading...</div>;
}

function App() {

    return (
        <Router>
            <div>
                <Navbar bg="light" expand="lg">
                    <Navbar.Brand href="/">Guardian Quick Crossword</Navbar.Brand>
                </Navbar>

                {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
                <Switch>
                    <Route exact path="/">
                        <Home/>
                    </Route>
                    <Switch>
                        <Route path="/play/:id" children={<PlaySession/>}/>
                    </Switch>
                </Switch>
            </div>
        </Router>
    );
}

export default App;
