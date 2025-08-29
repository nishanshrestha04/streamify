from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import ffmpeg
import os
from video.models import Video

class Command(BaseCommand):
    help = 'Extract video durations for all existing videos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )

    def extract_video_duration(self, video_file_path):
        """Extract video duration using ffmpeg"""
        try:
            if not os.path.exists(video_file_path):
                self.stdout.write(
                    self.style.WARNING(f'Video file not found: {video_file_path}')
                )
                return None
                
            probe = ffmpeg.probe(video_file_path)
            
            # Find the video stream
            video_stream = None
            for stream in probe['streams']:
                if stream['codec_type'] == 'video':
                    video_stream = stream
                    break
            
            if video_stream and 'duration' in video_stream:
                duration = float(video_stream['duration'])
                return timedelta(seconds=duration)
            
            # Fallback: try to get duration from format
            if 'format' in probe and 'duration' in probe['format']:
                duration = float(probe['format']['duration'])
                return timedelta(seconds=duration)
                
            return None
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error extracting duration: {e}')
            )
            return None

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Get all videos without duration
        videos_without_duration = Video.objects.filter(duration__isnull=True)
        total_videos = videos_without_duration.count()
        
        if total_videos == 0:
            self.stdout.write(
                self.style.SUCCESS('All videos already have duration information!')
            )
            return
        
        self.stdout.write(
            self.style.WARNING(f'Found {total_videos} videos without duration information')
        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )
        
        updated_count = 0
        failed_count = 0
        
        for video in videos_without_duration:
            try:
                if video.video_file:
                    video_path = video.video_file.path
                    self.stdout.write(f'Processing: {video.title} ({video_path})')
                    
                    duration = self.extract_video_duration(video_path)
                    
                    if duration:
                        if not dry_run:
                            video.duration = duration
                            video.save()
                        
                        duration_str = str(duration).split('.')[0]  # Remove microseconds
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ Duration: {duration_str}')
                        )
                        updated_count += 1
                    else:
                        self.stdout.write(
                            self.style.ERROR(f'  ✗ Could not extract duration')
                        )
                        failed_count += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ No video file: {video.title}')
                    )
                    failed_count += 1
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Error processing {video.title}: {e}')
                )
                failed_count += 1
        
        # Summary
        self.stdout.write('\n' + '='*50)
        if dry_run:
            self.stdout.write(
                self.style.WARNING(f'DRY RUN SUMMARY:')
            )
            self.stdout.write(f'  - Would update: {updated_count} videos')
        else:
            self.stdout.write(
                self.style.SUCCESS(f'UPDATE COMPLETE:')
            )
            self.stdout.write(f'  - Updated: {updated_count} videos')
        
        self.stdout.write(f'  - Failed: {failed_count} videos')
        self.stdout.write(f'  - Total processed: {total_videos} videos')
