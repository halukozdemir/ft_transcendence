import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .moderation import moderate_text


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Route each socket to a room-specific broadcast group.
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = (data.get('message') or '').strip()
        sender = (data.get('sender') or 'anonymous').strip()
        timestamp = (data.get('timestamp') or '').strip()

        if not message:
            return

        # Run moderation before fan-out so all recipients see identical sanitized content.
        result = await moderate_text(message)
        moderated = result['flagged']
        message = result['censored'] if moderated else message

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender,
                'timestamp': timestamp,
                'moderated': moderated,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event.get('sender', 'anonymous'),
            'timestamp': event.get('timestamp', ''),
            'moderated': event.get('moderated', False),
        }))
