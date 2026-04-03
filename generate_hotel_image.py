#!/usr/bin/env python3
"""
Script pour générer l'image de l'Hôtel de Ville Belamanana
Crée une image PNG 2D colorée du bâtiment
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_hotel_image():
    """Crée une image PNG de l'Hôtel de Ville Belamanana"""
    
    # Dimensions
    width = 1024
    height = 768
    
    # Créer l'image avec fond gradient
    image = Image.new('RGB', (width, height), color='#87CEEB')
    draw = ImageDraw.Draw(image, 'RGBA')
    
    # Fond gradient ciel (approximation avec rectangles)
    for i in range(height):
        ratio = i / height
        # Interpolation entre les couleurs
        r = int(135 + (224 - 135) * ratio)
        g = int(206 + (246 - 206) * ratio)
        b = int(235 + (255 - 235) * ratio)
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    # Soleil
    sun_x, sun_y = 150, 100
    sun_radius = 50
    draw.ellipse([sun_x - sun_radius, sun_y - sun_radius, 
                  sun_x + sun_radius, sun_y + sun_radius], fill='#FFD700')
    draw.ellipse([sun_x - sun_radius - 20, sun_y - sun_radius - 20, 
                  sun_x + sun_radius + 20, sun_y + sun_radius + 20], 
                outline='#FFD700', width=3)
    
    # Nuages
    draw_cloud(draw, 250, 80, 80, '#FFFFFF')
    draw_cloud(draw, 700, 120, 100, '#FFFFFF')
    draw_cloud(draw, 900, 70, 90, '#FFFFFF')
    
    # Sol
    draw.rectangle([0, height - 120, width, height], fill='#8B7355')
    draw.rectangle([0, height - 100, width, height - 80], fill='#A0826D')
    
    # Herbe
    for i in range(0, width, 30):
        draw.rectangle([i, height - 120, i + 20, height - 90], fill='#228B22')
    
    # Bâtiment principal
    building_x, building_y = 250, 300
    building_w, building_h = 500, 280
    
    # Corps du bâtiment
    draw.rectangle([building_x, building_y, building_x + building_w, building_y + building_h], 
                   fill='#CD853F', outline='#8B4513', width=4)
    
    # Fenêtres
    window_spacing = 60
    window_size = 40
    window_start_x = building_x + 40
    window_start_y = building_y + 50
    
    for row in range(3):
        for col in range(7):
            x = window_start_x + col * window_spacing
            y = window_start_y + row * window_spacing
            draw.rectangle([x, y, x + window_size, y + window_size], 
                          fill='#87CEEB', outline='#696969', width=2)
            # Croix
            draw.line([(x + window_size // 2, y), (x + window_size // 2, y + window_size)], 
                     fill='#696969', width=1)
            draw.line([(x, y + window_size // 2), (x + window_size, y + window_size // 2)], 
                     fill='#696969', width=1)
    
    # Porte principale
    door_x = building_x + building_w // 2 - 40
    door_y = building_y + building_h - 80
    draw.rectangle([door_x, door_y, door_x + 80, door_y + 80], 
                   fill='#8B4513', outline='#654321', width=2)
    # Poignée
    draw.ellipse([door_x + 36, door_y + 36, door_x + 44, door_y + 44], 
                fill='#FFD700')
    
    # Toit (Triangle)
    roof_points = [
        (building_x, building_y),
        (building_x + building_w // 2, building_y - 80),
        (building_x + building_w, building_y)
    ]
    draw.polygon(roof_points, fill='#DC143C', outline='#8B0000', width=2)
    
    # Cloche/Clocher
    clock_x = building_x + building_w // 2
    clock_y = building_y - 130
    draw.rectangle([clock_x - 30, clock_y, clock_x + 30, clock_y + 50], 
                   fill='#DAA520', outline='#8B4513', width=2)
    
    # Cloche en haut
    draw.ellipse([clock_x - 15, clock_y - 25, clock_x + 15, clock_y - 5], 
                fill='#FFD700', outline='#8B4513', width=2)
    
    # Drapeau
    draw.rectangle([clock_x + 15, clock_y - 40, clock_x + 45, clock_y - 20], 
                   fill='#FF6347', outline='#8B0000', width=2)
    
    # Colonnes de support
    for i in range(8):
        col_x = building_x + 50 + i * 60
        draw.rectangle([col_x, building_y + building_h, col_x + 20, building_y + building_h + 40], 
                       fill='#D3D3D3', outline='#A9A9A9', width=1)
    
    # Marches
    for i in range(3):
        step_x = building_x + building_w // 2 - 60 - i * 20
        step_y = building_y + building_h + 30 + i * 15
        draw.rectangle([step_x, step_y, step_x + 120 + i * 40, step_y + 15], 
                       fill='#A9A9A9', outline='#696969', width=1)
    
    # Texte
    try:
        # Essayer de charger une police, sinon utiliser la défaut
        font = ImageFont.truetype("arial.ttf", 36)
    except:
        font = ImageFont.load_default()
    
    text = "Hôtel de Ville Belamanana"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_x = (width - (text_bbox[2] - text_bbox[0])) // 2
    text_y = height - 50
    
    # Ombre du texte
    draw.text((text_x + 2, text_y + 2), text, fill=(0, 0, 0, 160), font=font)
    # Texte principal
    draw.text((text_x, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    return image

def draw_cloud(draw, x, y, width, color):
    """Dessine un nuage"""
    radius = width // 3
    draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=color)
    draw.ellipse([x + width // 3 - radius, y - width // 6 - radius, 
                  x + width // 3 + radius, y - width // 6 + radius], fill=color)
    draw.ellipse([x + width * 2 // 3 - radius, y - radius, 
                  x + width * 2 // 3 + radius, y + radius], fill=color)

def main():
    """Point d'entrée principal"""
    print("Génération de l'image Hôtel de Ville Belamanana...")
    
    # Créer le répertoire img s'il n'existe pas
    os.makedirs('img', exist_ok=True)
    
    # Créer l'image
    image = create_hotel_image()
    
    # Sauvegarder l'image
    output_path = 'img/hotel_belamanana.png'
    image.save(output_path, 'PNG')
    print(f"✅ Image sauvegardée: {output_path}")
    print(f"   Dimensions: {image.width}x{image.height}")

if __name__ == '__main__':
    main()
