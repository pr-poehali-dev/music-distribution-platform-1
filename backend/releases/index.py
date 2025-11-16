import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user releases (create, read, update, delete)
    Args: event with httpMethod, body (userId, releaseId, title, genre, etc.)
    Returns: HTTP response with release data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('userId')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'userId required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, title, genre, release_date, description, 
                           music_author, lyrics_author, audio_url, cover_url,
                           status, streams, revenue, created_at, updated_at
                    FROM releases 
                    WHERE user_id = %s 
                    ORDER BY created_at DESC
                """, (user_id,))
                releases = cur.fetchall()
                
                releases_list = []
                for r in releases:
                    releases_list.append({
                        'id': r['id'],
                        'title': r['title'],
                        'genre': r['genre'],
                        'releaseDate': r['release_date'].isoformat() if r['release_date'] else None,
                        'description': r['description'],
                        'musicAuthor': r['music_author'],
                        'lyricsAuthor': r['lyrics_author'],
                        'audioUrl': r['audio_url'],
                        'coverUrl': r['cover_url'],
                        'status': r['status'],
                        'streams': r['streams'],
                        'revenue': float(r['revenue']) if r['revenue'] else 0
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'releases': releases_list}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('userId')
            title = body_data.get('title', '').strip()
            genre = body_data.get('genre', '').strip()
            release_date = body_data.get('releaseDate')
            description = body_data.get('description', '').strip()
            music_author = body_data.get('musicAuthor', '').strip()
            lyrics_author = body_data.get('lyricsAuthor', '').strip()
            audio_url = body_data.get('audioUrl')
            cover_url = body_data.get('coverUrl')
            
            if not user_id or not title or not genre:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все обязательные поля'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO releases 
                    (user_id, title, genre, release_date, description, music_author, lyrics_author, audio_url, cover_url, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, title, genre, status, streams, revenue
                """, (user_id, title, genre, release_date, description, music_author, lyrics_author, audio_url, cover_url, 'Черновик'))
                release = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'release': {
                            'id': release['id'],
                            'title': release['title'],
                            'genre': release['genre'],
                            'status': release['status'],
                            'streams': release['streams'],
                            'revenue': float(release['revenue']) if release['revenue'] else 0
                        }
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            release_id = body_data.get('releaseId')
            user_id = body_data.get('userId')
            
            if not release_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'releaseId and userId required'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            params = []
            
            if 'title' in body_data and body_data['title']:
                updates.append('title = %s')
                params.append(body_data['title'])
            if 'genre' in body_data and body_data['genre']:
                updates.append('genre = %s')
                params.append(body_data['genre'])
            if 'releaseDate' in body_data:
                updates.append('release_date = %s')
                params.append(body_data['releaseDate'])
            if 'description' in body_data:
                updates.append('description = %s')
                params.append(body_data['description'])
            if 'musicAuthor' in body_data:
                updates.append('music_author = %s')
                params.append(body_data['musicAuthor'])
            if 'lyricsAuthor' in body_data:
                updates.append('lyrics_author = %s')
                params.append(body_data['lyricsAuthor'])
            if 'audioUrl' in body_data:
                updates.append('audio_url = %s')
                params.append(body_data['audioUrl'])
            if 'coverUrl' in body_data:
                updates.append('cover_url = %s')
                params.append(body_data['coverUrl'])
            if 'status' in body_data:
                updates.append('status = %s')
                params.append(body_data['status'])
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            updates.append('updated_at = CURRENT_TIMESTAMP')
            params.extend([release_id, user_id])
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                query = f"UPDATE releases SET {', '.join(updates)} WHERE id = %s AND user_id = %s RETURNING id"
                cur.execute(query, params)
                result = cur.fetchone()
                conn.commit()
                
                if not result:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Release not found'}),
                        'isBase64Encoded': False
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            release_id = body_data.get('releaseId')
            user_id = body_data.get('userId')
            
            if not release_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'releaseId and userId required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute("UPDATE releases SET status = 'Удалён' WHERE id = %s AND user_id = %s", (release_id, user_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()
