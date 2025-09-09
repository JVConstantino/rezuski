-- Add youtubeUrl column to properties table
ALTER TABLE public.properties 
ADD COLUMN "youtubeUrl" text;

-- Add comment to describe the column
COMMENT ON COLUMN public.properties."youtubeUrl" IS 'URL do vídeo do YouTube da propriedade';