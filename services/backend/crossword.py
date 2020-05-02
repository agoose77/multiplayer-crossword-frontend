from aiohttp import web, ClientSession, WSMsgType
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from json import loads
from uuid import uuid1
from dataclasses import dataclass
import traceback
import argparse

routes = web.RouteTableDef()
WEB_SOCKET_HEARTBEAT = 20 # seconds

@dataclass
class Session:
    name: str
    id: str
    listeners: list
    board: dict
    moves: []

    def to_json(self):
        return {
            "name": self.name,
            "id": self.id,
            "board": self.board,
            "moves": self.moves,
        }


@routes.get("/sessions")
async def sessions(request):
    data = [s.to_json() for id, s in sessions.items()]
    return web.json_response(data)


@routes.get("/sessions/{id}")
async def sessions(request):
    session_id = request.match_info["id"]
    session = sessions[session_id]
    return web.json_response(session.to_json())


@routes.post("/sessions")
async def sessions(request):
    query = await request.post()
    session_name = query["name"]
    crossword_index = query["crossword"]

    try:
        crossword = await load_crossword(crossword_index)
    except:
        raise web.HTTPNotFound()
    session_id = str(uuid1())
    session = Session(session_name, session_id, [], crossword, [])
    sessions[session_id] = session
    return web.HTTPCreated(headers={"Location": f"/sessions/{session_id}"})


@routes.delete("/sessions/{id}")
async def sessions(request):
    session_id = request.match_info["id"]
    try:
        del sessions[session_id]
    except KeyError:
        raise web.HTTPNotFound()
    return web.HTTPOk()


async def load_crossword(index: int) -> dict:
    url = urljoin("https://www.theguardian.com/crosswords/quick/", str(index))

    async with ClientSession() as session:
        response = await session.get(url)
        soup = BeautifulSoup(await response.read(), "html.parser")

    (div,) = soup.select("div[data-crossword-data]")

    return loads(div.get("data-crossword-data"))


async def broadcast_move_to_session(ws, data):
    session_id = data["id"]
    move = data["move"]

    session = sessions[session_id]
    session.moves.append(move)
    print([id(w) for w in session.listeners], id(ws))
    for ws_listener in session.listeners.copy():
        if not ws_listener is ws:
            try:
                await ws_listener.send_json(move)
            except:
                traceback.print_exc()
                # Remove bad websocket
                session.listeners.remove(ws)
                print(f"Removing bad websocket {id(ws)}")

async def subscribe_to_session(ws, data):
    session_id = data["id"]
    session = sessions[session_id]
    session.listeners.append(ws)


@routes.get("/ws")
async def web_socket_server(request):
    print("On WS Request")
    ws = web.WebSocketResponse(heartbeat=WEB_SOCKET_HEARTBEAT)
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == WSMsgType.ERROR:
            print("ws connection closed with exception %s" % ws.exception())

        elif msg.type == WSMsgType.TEXT:
            data = loads(msg.data)
            print(data, 'DATA')
            msg_type = data["type"]
            msg_content = data["content"]
            if msg_type == "subscribe":
                await subscribe_to_session(ws, msg_content)
            elif msg_type == "move":
                await broadcast_move_to_session(ws, msg_content)

    print("websocket connection closed")
    return ws


app = web.Application()
app.add_routes(routes)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', default=5000)
    args = parser.parse_args()

    sessions = {}
    web.run_app(app, port=args.port)
