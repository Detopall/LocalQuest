from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from db.database import get_db_connection
import sqlite3
from typing import Literal

router = APIRouter()

@router.get("/filter")
async def filter(request: Request, db: sqlite3.Connection = Depends(get_db_connection)):
	# get query parameters
	query_params = request.query_params

	price_value = handleParams(query_params, "price")
	topics_value = handleParams(query_params, "topic")

	data_obj = {
		"price": price_value,
		"topic": topics_value
	}

	return JSONResponse(content={"message": "Filtered data", "data": data_obj})

def handleParams(params: dict, param_type: Literal["price", "topic"]):
	"""
	Handle query parameters
	"""

	params_values = params.get(param_type)
	if not params_values:
		raise HTTPException(status_code=400, detail=f"{param_type} is required")

	if param_type == "price":
		params_values = [float(x) for x in params_values.split(",")] if params.get(param_type) else None
		if not params_values:
			raise HTTPException(status_code=400, detail=f"{param_type} is required")

	else:
		params_values = params_values.split(",") if params.get(param_type) else None
		if not params_values:
			raise HTTPException(status_code=400, detail=f"{params_values} are required")

	return params_values
