"""
Simple authentication for admin endpoints
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets
import os

security = HTTPBasic()

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials (hardcoded for now)"""
    correct_username = secrets.compare_digest(
        credentials.username, 
        os.getenv("ADMIN_USER", "admin")
    )
    correct_password = secrets.compare_digest(
        credentials.password, 
        os.getenv("ADMIN_PASS", "changeme123")
    )
    
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return {"username": credentials.username}