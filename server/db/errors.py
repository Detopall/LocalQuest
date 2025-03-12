from enum import Enum


class DbError(Enum):
    USER_NOT_FOUND_ERROR = "User not found"
    EMAIL_ALREADY_EXISTS_ERROR = "Email already exists"
    TOPIC_NOT_FOUND_ERROR = "Topic not found"
    INVALID_QUEST_STATUS_ERROR = "Invalid quest status"
    USER_ALREADY_APPLIED_ERROR = "User already applied to this quest"
    QUEST_NOT_FOUND_ERROR = "Quest not found"
    USER_ALREADY_EXISTS_ERROR = "User already exists"
    USER_IS_CREATOR_ERROR = "User is the creator of this quest"
