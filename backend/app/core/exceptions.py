"""
NEXO — Custom Exception Handlers
"""
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse


class NEXOException(Exception):
    """Base application exception."""
    def __init__(self, message: str, status_code: int = 500, detail: str = None):
        self.message = message
        self.status_code = status_code
        self.detail = detail or message
        super().__init__(self.message)


class NotFoundException(NEXOException):
    def __init__(self, resource: str, id: str = None):
        msg = f"{resource} not found" if not id else f"{resource} with id '{id}' not found"
        super().__init__(msg, status_code=status.HTTP_404_NOT_FOUND)


class UnauthorizedException(NEXOException):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(NEXOException):
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN)


class ValidationException(NEXOException):
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


class ConflictException(NEXOException):
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_409_CONFLICT)


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers."""

    @app.exception_handler(NEXOException)
    async def forgemind_exception_handler(request: Request, exc: NEXOException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.message, "detail": exc.detail},
        )

    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc):
        return JSONResponse(
            status_code=404,
            content={"error": "Resource not found"},
        )

    @app.exception_handler(500)
    async def internal_server_error_handler(request: Request, exc):
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"},
        )
