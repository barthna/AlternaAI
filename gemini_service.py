import json
import logging
import os
from typing import Dict, Any, Optional

from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv() 
# Configure logging
logging.basicConfig(level=logging.DEBUG)

class GeminiService:
    def __init__(self):
        """Initialize Gemini client with API key"""
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        self.client = genai.Client(api_key=api_key)
        
    def get_item_details_and_alternatives(self, item_name: str) -> Optional[Dict[str, Any]]:
        """Get concise item details and alternatives from Gemini with optimized responses"""
        try:
            system_prompt = """You are a product expert. Provide brief, clear information for Indian market.
            
            Response format (JSON):
            {
                "original_item": {
                    "name": "item name",
                    "description": "concise 1-line description (max 15 words)",
                    "usage": "main use (max 8 words)",
                    "availability": "Available/Limited/Out of Stock",
                    "price_inr": "₹X,XXX - ₹X,XXX",
                    "performance": "Good/Excellent/Average",
                    "category": "product category"
                },
                "alternatives": [
                    {
                        "name": "alternative name",
                        "description": "brief description (max 12 words)",
                        "category": "category",
                        "usage": "main use (max 6 words)",
                        "price_inr": "₹X,XXX - ₹X,XXX", 
                        "availability": "Available/Limited/Out of Stock",
                        "performance": "Good/Excellent/Average",
                        "compatibility": "High/Medium/Low"
                    }
                ]
            }
            
            Keep ALL text very short. Provide 4-5 practical alternatives.
            Use realistic Indian market prices. Be concise and clear."""
            
            user_prompt = f"Find alternatives for: {item_name}"
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Content(role="user", parts=[types.Part(text=user_prompt)])
                ],
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.3,
                ),
            )
            
            if response.text:
                try:
                    result = json.loads(response.text)
                    logging.info(f"Successfully parsed Gemini response for {item_name}")
                    return result
                except json.JSONDecodeError as e:
                    logging.error(f"Failed to parse JSON response: {e}")
                    logging.error(f"Raw response: {response.text}")
                    return None
            else:
                logging.error("Empty response from Gemini")
                return None
                
        except Exception as e:
            logging.error(f"Error getting item details: {str(e)}")
            return None
    
    def get_detailed_comparison(self, original_item: str, alternative_item: str) -> Optional[Dict[str, Any]]:
        """Get brief comparison between original and alternative items"""
        try:
            system_prompt = """You are a product comparison expert. Provide short, clear comparison.
            
            Response format (JSON):
            {
                "original": {
                    "name": "original item name",
                    "description": "brief description (max 12 words)",
                    "pros": ["2-3 key advantages (max 8 words each)"],
                    "cons": ["2-3 main disadvantages (max 8 words each)"],
                    "price_inr": "₹X,XXX - ₹X,XXX",
                    "availability": "Available/Limited/Out of Stock",
                    "performance_score": "8.5",
                    "use_cases": ["2 primary uses (max 6 words each)"],
                    "compatibility": "brief compatibility info"
                },
                "alternative": {
                    "name": "alternative item name", 
                    "description": "brief description (max 12 words)",
                    "pros": ["2-3 key advantages (max 8 words each)"],
                    "cons": ["2-3 main disadvantages (max 8 words each)"],
                    "price_inr": "₹X,XXX - ₹X,XXX",
                    "availability": "Available/Limited/Out of Stock",
                    "performance_score": "7.8",
                    "use_cases": ["2 primary uses (max 6 words each)"],
                    "compatibility": "brief compatibility info"
                },
                "comparison": {
                    "cost_difference": "short cost analysis (max 10 words)",
                    "performance_difference": "performance comparison (max 10 words)", 
                    "availability_difference": "availability comparison (max 8 words)",
                    "compatibility_analysis": "compatibility comparison (max 8 words)",
                    "recommendation": "which is better and why (max 12 words)",
                    "key_differences": ["3 main differences (max 8 words each)"]
                }
            }
            
            Keep ALL text very short. Use real Indian market data."""
            
            user_prompt = f"Compare: '{original_item}' vs '{alternative_item}'"
            
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Content(role="user", parts=[types.Part(text=user_prompt)])
                ],
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    temperature=0.3,
                ),
            )
            
            if response.text:
                try:
                    result = json.loads(response.text)
                    logging.info(f"Successfully parsed comparison for {original_item} vs {alternative_item}")
                    return result
                except json.JSONDecodeError as e:
                    logging.error(f"Failed to parse JSON comparison response: {e}")
                    logging.error(f"Raw response: {response.text}")
                    return None
            else:
                logging.error("Empty comparison response from Gemini")
                return None
                
        except Exception as e:
            logging.error(f"Error getting detailed comparison: {str(e)}")
            return None
