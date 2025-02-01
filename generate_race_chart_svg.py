import pandas as pd
import svgwrite
from svgwrite import cm, mm

# Read the CSV file
df = pd.read_csv('WR1_points.csv')

# Constants for SVG dimensions and styling
WIDTH = 1200
HEIGHT = 800
MARGIN_LEFT = 150
MARGIN_RIGHT = 50
MARGIN_TOP = 50
MARGIN_BOTTOM = 50
CHART_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT
CHART_HEIGHT = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM

# Color scheme for games
COLORS = {
    'Game 1': '#ff7d00',
    'Game 2': '#ffb366',
    'Game 3': '#f0d1b1',
    'Game 4': '#a4243b',
    'Game 5': '#F07167',
    'Game 6': '#15616d',
    'Game 7': '#3998aa',
    'Game 8': '#8bbbc4'
}

# Create SVG document
dwg = svgwrite.Drawing('4.race_chart_WR1.svg', size=(WIDTH, HEIGHT))

# Add title
dwg.add(dwg.text('ALGS Championship: Winners Round 1', 
                 insert=(WIDTH/2, 30), 
                 text_anchor="middle",
                 style="font-family: Inter, sans-serif; font-size: 24px; font-weight: bold"))

# Calculate cumulative scores for each game
game_cols = [f'Game {i}' for i in range(1, 9)]
cumulative_scores = pd.DataFrame()
for i, game in enumerate(game_cols):
    if i == 0:
        cumulative_scores[game] = df[game]
    else:
        cumulative_scores[game] = cumulative_scores[game_cols[i-1]] + df[game]

# Get maximum score for scaling
max_score = cumulative_scores.max().max()

# Function to convert score to Y position
def score_to_y(score):
    return MARGIN_TOP + CHART_HEIGHT * (1 - score/max_score)

# Function to convert game number to X position
def game_to_x(game_num):
    return MARGIN_LEFT + CHART_WIDTH * (game_num - 1) / 7

# Draw background grid
for i in range(0, int(max_score) + 1, 10):
    y = score_to_y(i)
    dwg.add(dwg.line(start=(MARGIN_LEFT, y), end=(WIDTH-MARGIN_RIGHT, y),
                     stroke='#eee', stroke_width=1))
    dwg.add(dwg.text(str(i), insert=(MARGIN_LEFT-30, y+5),
                     style="font-family: Inter, sans-serif; font-size: 12px"))

# Draw game labels
for i, game in enumerate(game_cols):
    x = game_to_x(i+1)
    dwg.add(dwg.text(game, insert=(x, HEIGHT-20),
                     style="font-family: Inter, sans-serif; font-size: 12px",
                     text_anchor="middle"))

# Draw lines for each team
for team_idx, team in enumerate(df['Team']):
    points = []
    for i, game in enumerate(game_cols):
        x = game_to_x(i+1)
        y = score_to_y(cumulative_scores.iloc[team_idx][game])
        points.append((x, y))
    
    # Draw path
    path = dwg.path(d=['M', points[0][0], points[0][1]], stroke='#333', stroke_width=2, fill='none')
    for x, y in points[1:]:
        path.push(['L', x, y])
    dwg.add(path)
    
    # Add team name at the end
    last_x, last_y = points[-1]
    dwg.add(dwg.text(team, insert=(last_x + 10, last_y),
                     style="font-family: Inter, sans-serif; font-size: 12px"))

# Save the SVG
dwg.save()
