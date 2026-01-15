#!/bin/bash
ICON_SRC="assets/icon.png"
RES_DIR="android/app/src/main/res"

# Densities and sizes
# Array of "folder_suffix:icon_size:foreground_size"
SIZES=("mdpi:48:108" "hdpi:72:162" "xhdpi:96:216" "xxhdpi:144:324" "xxxhdpi:192:432")

for item in "${SIZES[@]}"; do
    IFS=":" read -r suffix icon_sz fg_sz <<< "$item"
    target_dir="$RES_DIR/mipmap-$suffix"
    
    echo "Processing $suffix..."
    
    # Create icon and round icon (using same for now)
    sips -s format png -z $icon_sz $icon_sz "$ICON_SRC" --out "$target_dir/ic_launcher.png" > /dev/null
    sips -s format png -z $icon_sz $icon_sz "$ICON_SRC" --out "$target_dir/ic_launcher_round.png" > /dev/null
    
    # Create foreground
    sips -s format png -z $fg_sz $fg_sz "$ICON_SRC" --out "$target_dir/ic_launcher_foreground.png" > /dev/null
    
    # Rename to .webp to match existing file structure (even if PNG content for now)
    # Actually, let's try to convert to webp if possible, or just overwrite the .webp files with png content
    # Android handles PNG content in .webp extension sometimes, but it's better to be correct.
    # On macOS, sips can do: sips -s format webp ...
    
    mv "$target_dir/ic_launcher.png" "$target_dir/ic_launcher.webp"
    mv "$target_dir/ic_launcher_round.png" "$target_dir/ic_launcher_round.webp"
    mv "$target_dir/ic_launcher_foreground.png" "$target_dir/ic_launcher_foreground.webp"
done

echo "Icon update complete!"
