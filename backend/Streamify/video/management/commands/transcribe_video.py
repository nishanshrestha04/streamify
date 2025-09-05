import whisper
import torch
from django.core.management.base import BaseCommand
from video.models import Video
import logging
import os

# Configure logging
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Transcribes a video file using OpenAI Whisper and saves the transcript.'

    def add_arguments(self, parser):
        parser.add_argument('video_id', type=int, help='The ID of the video to transcribe.')

    def handle(self, *args, **options):
        video_id = options['video_id']
        
        try:
            video = Video.objects.get(pk=video_id)
        except Video.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Video with ID {video_id} does not exist.'))
            return

        if not os.path.exists(video.video_file.path):
            self.stdout.write(self.style.ERROR(f'Video file not found at: {video.video_file.path}'))
            video.processing_status = 'failed'
            video.save()
            return

        self.stdout.write(f'Starting transcription for video: {video.title} (ID: {video_id})')
        video.processing_status = 'transcribing'
        video.save()

        try:
            # Check for GPU
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self.stdout.write(f"Using device: {device}")

            # Load the model
            # Model options: "tiny", "base", "small", "medium", "large"
            # "base" is a good starting point.
            model = whisper.load_model("base", device=device)
            
            self.stdout.write("Model loaded. Starting transcription process...")

            # Transcribe the video
            result = model.transcribe(video.video_file.path, verbose=True)

            # Save the transcript
            video.transcript = result
            video.processing_status = 'ready'
            video.save()
            
            self.stdout.write(self.style.SUCCESS(f'Successfully transcribed video ID {video_id}.'))

        except Exception as e:
            logger.error(f'Error transcribing video ID {video_id}: {e}', exc_info=True)
            video.processing_status = 'failed'
            video.save()
            self.stdout.write(self.style.ERROR(f'An error occurred during transcription: {e}'))
