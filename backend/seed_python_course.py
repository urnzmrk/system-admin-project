"""Idempotently add the authored Python curriculum without touching other modules.

This is an explicit one-time content import, not an application-startup hook.
It inserts missing Python topics and lessons and never updates or deletes rows.
"""

from python_course import COURSE_LEVELS, render_lesson_content
from app import get_db_connection


def seed_python_course():
    connection = get_db_connection()
    cursor = None
    inserted_topics = 0
    inserted_lessons = 0

    try:
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()

        for level in COURSE_LEVELS:
            cursor.execute(
                """
                SELECT id, order_number
                FROM topics
                WHERE module_key = 'python' AND title = %s
                LIMIT 1
                FOR UPDATE
                """,
                (level["title"],),
            )
            topic = cursor.fetchone()

            if topic is None:
                cursor.execute(
                    "SELECT COALESCE(MAX(order_number), 0) + 1 AS next_order "
                    "FROM topics WHERE module_key = 'python'"
                )
                next_order = cursor.fetchone()["next_order"]
                cursor.execute(
                    """
                    INSERT INTO topics (title, description, order_number, module_key)
                    VALUES (%s, %s, %s, 'python')
                    """,
                    (level["title"], level["description"], next_order),
                )
                topic_id = cursor.lastrowid
                inserted_topics += 1
            else:
                topic_id = topic["id"]

            for lesson_order, lesson in enumerate(level["lessons"], 1):
                title, source, explanation, example, exercise, objective = lesson
                cursor.execute(
                    "SELECT id FROM subtopics WHERE topic_id = %s AND title = %s LIMIT 1",
                    (topic_id, title),
                )
                if cursor.fetchone() is not None:
                    continue

                cursor.execute(
                    "SELECT COALESCE(MAX(order_number), 0) + 1 AS next_order "
                    "FROM subtopics WHERE topic_id = %s",
                    (topic_id,),
                )
                next_order = cursor.fetchone()["next_order"]
                cursor.execute(
                    """
                    INSERT INTO subtopics (topic_id, title, content, order_number)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (
                        topic_id,
                        title,
                        render_lesson_content(source, explanation, example, exercise, objective),
                        next_order if next_order >= lesson_order else lesson_order,
                    ),
                )
                inserted_lessons += 1

        connection.commit()
        return inserted_topics, inserted_lessons
    except Exception:
        connection.rollback()
        raise
    finally:
        if cursor:
            cursor.close()
        connection.close()


if __name__ == "__main__":
    topic_count, lesson_count = seed_python_course()
    print(f"Python course import complete: {topic_count} topics and {lesson_count} lessons inserted.")
