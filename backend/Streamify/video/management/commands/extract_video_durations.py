from django.core.management.base import BaseCommand
from datetime import timedelta
import ffmpeg
import os
from video.models import Video

class Command(BaseCommand):
    def extract_video_duration(self, video_file_path):
        try:
            if not os.path.exists(video_file_path):
                return None
                
            probe = ffmpeg.probe(video_file_path)

            for stream in probe['streams']:
                if stream['codec_type'] == 'video':
                    if 'duration' in stream:
                        duration = float(stream['duration'])
                        return timedelta(seconds=duration)
            
            if 'format' in probe and 'duration' in probe['format']:
                duration = float(probe['format']['duration'])
                return timedelta(seconds=duration)
                
            return None
        except Exception:
            return None

    def handle(self, *args, **options):
        videos_without_duration = Video.objects.filter(duration__isnull=True)
        
        for video in videos_without_duration:
            if video.video_file:
                duration = self.extract_video_duration(video.video_file.path)
                if duration:
                    video.duration = duration
                    video.save()