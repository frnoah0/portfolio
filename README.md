# fr_noah Portfolio Setup

## File structure
Place these files like this:

/
├─ index.html
├─ styles.css
├─ script.js
├─ site-data.json
└─ /files
   ├─ hero-placeholder.jpg
   ├─ project-aether-1.jpg
   ├─ project-aether-2.mp4
   ├─ neon-freight-1.mp4
   ├─ neon-freight-2.mp4
   ├─ titan-arena-1.jpg
   ├─ pulse-kit-1.jpg
   └─ pulse-kit-2.jpg

## Editing the site
Everything important is controlled from `site-data.json`.

You can edit:
- brand name
- subtitle
- hero image path
- nav labels
- section text
- theme colors
- contact links
- contact form settings
- all portfolio projects
- project media paths
- year
- role

## Adding a new project
Add another object to the `projects` array in `site-data.json`.

Each project supports:
- `title`
- `description`
- `year`
- `role`
- `tags`
- `media`

Each media item supports:
- `type`: `"image"` or `"video"`
- `path`: `"files/your-file-name.ext"`
- `mime`: optional for videos
- `alt`: optional for images
- `poster`: optional for videos
- `controls`: optional boolean for videos if you want controls shown

Example:
```json
{
  "title": "New Project",
  "description": "Short project summary.",
  "year": "2026",
  "role": "Gameplay • Systems",
  "tags": ["Roblox", "UI"],
  "media": [
    {
      "type": "image",
      "path": "files/new-project-1.jpg",
      "alt": "New project screenshot"
    },
    {
      "type": "video",
      "path": "files/new-project-2.mp4",
      "mime": "video/mp4"
    }
  ]
}