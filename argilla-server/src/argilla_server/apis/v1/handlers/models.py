import logging
from urllib.parse import urljoin

import httpx
from fastapi import APIRouter, Depends, HTTPException
from starlette.requests import Request
from starlette.responses import StreamingResponse

from argilla_server.models import User
from argilla_server.policies import _exists_workspace_user_by_user_and_workspace_name
from argilla_server.security import auth
from argilla_server.settings import settings

_LOGGER = logging.getLogger("models")

router = APIRouter(tags=["models"])

client = httpx.AsyncClient(timeout=10.0)

@router.api_route("/models/{rest_of_path:path}", 
                  methods=["GET", "POST", "PUT", "DELETE"], 
                  response_class=StreamingResponse)
async def proxy(request: Request, rest_of_path: str,
                current_user: User = Depends(auth.get_current_user)):
    url = urljoin(settings.extralit_url, rest_of_path)
    params = dict(request.query_params)

    print(f'PROXY {url} {params}, {current_user.username}')
    _LOGGER.info(f'PROXY {url} {params}, {current_user.username}')

    if 'workspace' not in params or not params['workspace']:
        raise HTTPException(status_code=500, detail="`workspace` is required in query parameters")

    if current_user:
        params['username'] = current_user.username

        if current_user.role != "owner":
            if not await _exists_workspace_user_by_user_and_workspace_name(current_user, params['workspace']):
                raise HTTPException(status_code=500,
                                    detail=f"{current_user.username} is not authorized to access workspace {params['workspace']}")

    if request.method == "GET":
        request = client.build_request("GET", url, params=params)
    elif request.method == "POST":
        data = await request.json()
        request = client.build_request("POST", url, json=data, params=params)
    elif request.method == "PUT":
        data = await request.json()
        request = client.build_request("PUT", url, data=data, params=params)
    elif request.method == "DELETE":
        request = client.build_request("DELETE", url, params=params)
    else:
        return {"message": "Method not supported"}

    async def stream_response():
        try:
            response = await client.send(request, stream=True)
            async for chunk in response.aiter_raw():
                yield chunk
        except httpx.ReadTimeout as exc:
            _LOGGER.error(f"Request to {exc.request.url!r} timed out.")
            yield b"Request timed out."
        except httpx.TimeoutException as exc:
            _LOGGER.error(f"Request to {exc.request.url!r} timed out.")
            yield b"Request timed out."
        except httpx.RequestError as exc:
            _LOGGER.error(f"An error occurred while requesting {exc.request.url!r}: {exc}")
            yield b"An error occurred while processing the request."

    return StreamingResponse(stream_response(), media_type="text/event-stream")

@router.on_event("startup")
async def startup_event():
    global client
    client = httpx.AsyncClient(timeout=10.0)

@router.on_event("shutdown")
async def shutdown():
    await client.aclose()
