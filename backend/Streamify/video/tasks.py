
from celery import shared_task
import whisper
import torch
from .models import Video
import logging
import os

logger = logging.getLogger(__name__)

@shared_task
def transcribe_video_task(video_id):
    """
    A Celery task to transcribe a video file using OpenAI Whisper.
    """
    try:
        video = Video.objects.get(pk=video_id)
    except Video.DoesNotExist:
        logger.error(f'Video with ID {video_id} does not exist.')
        return f"Video with ID {video_id} not found."

    if not os.path.exists(video.video_file.path):
        logger.error(f'Video file not found for video ID {video_id} at: {video.video_file.path}')
        video.processing_status = 'failed'
        video.save()
        return f"Video file for ID {video_id} not found."

    logger.info(f'Starting transcription for video: {video.title} (ID: {video_id})')
    video.processing_status = 'transcribing'
    video.save()

    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device} for transcription of video ID {video_id}")

        model = whisper.load_model("base", device=device)
        logger.info(f"Whisper model 'base' loaded for video ID {video_id}.")

        result = model.transcribe(video.video_file.path, verbose=True)

        video.transcript = result
        video.processing_status = 'ready'
        video.save()
        
        logger.info(f'Successfully transcribed video ID {video_id}.')
        return f"Successfully transcribed video ID {video_id}."

    except Exception as e:
        logger.error(f'Error transcribing video ID {video_id}: {e}', exc_info=True)
        video.processing_status = 'failed'
        video.save()
        return f"Error during transcription for video ID {video_id}: {e}"
