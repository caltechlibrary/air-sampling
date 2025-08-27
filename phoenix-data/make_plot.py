from bokeh.models import AjaxDataSource, HoverTool, CategoricalColorMapper, DatetimeRangeSlider, CustomJS, LegendItem, Legend
from bokeh.plotting import figure, output_file, save, show
from bokeh.layouts import column
from bokeh.io import output_notebook
from pyproj import Transformer
from datetime import datetime

source = AjaxDataSource(data_url="https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/phoenix/2025-08-25T10-00-00.json", polling_interval=None, mode='replace')

# --- Step 1: Define EPA colors (both PM10 and PM2.5) ---
epa_labels = {
    '0-9                  0-54': '#00E400',
    '9.1-35.4          55-154': '#FFFF00',
    '35.5-55.4        155-254': '#FF7E00',
    '55.5-125.4      255-354': '#FF0000',
    '125.5-225.4    355-424': '#8F3F97',
    '≥225.5             ≥425': '#7E0023'
}
epa_colors = {
    'category_1': '#00E400',
    'category_2': '#FFFF00',
    'category_3': '#FF7E00',
    'category_4': '#FF0000',
    'category_5': '#8F3F97',
    'category_6': '#7E0023'
}

start = datetime.strptime('2025-02-23T10-00-00',"%Y-%m-%dT%H-%M-%S")
end = datetime.strptime('2025-08-25T11-20-00',"%Y-%m-%dT%H-%M-%S")

slider = DatetimeRangeSlider(start=start, end=end, value=(start,end), title="Time of measurement")
callback = CustomJS(args=dict(source=source, slider=slider), code="""
        function timestampToFilename(timestamp) {
        // Accepts Date object, string, or number
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

        const pad = n => String(n).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Months are zero-indexed
        const day = pad(date.getDate());
        const hour = pad(date.getHours());
        const minute = pad(date.getMinutes());
        const second = pad(date.getSeconds());

        return `${year}-${month}-${day}T${hour}-${minute}-${second}.json`;
        }
        var timestamp = slider.value[0];
        var dateString = timestampToFilename(timestamp)
        console.log(dateString);
        var base = 'https://z44g6g2rrl.execute-api.us-west-2.amazonaws.com/test/phoenix/';
        var full = base.concat(dateString)
        source.data_url = full
        console.log(full)
        source.get_data(source.mode);
        """)
slider.js_on_change('value', callback)


# Set up figure - using the formatted time string for the title
p = figure(x_axis_type="mercator", y_axis_type="mercator",x_range=(-13100000, -13200000),
           y_range=(4040000, 4060000),
               width=900, height=700, title=f"PM10 (Hexagons) + PM2.5 (Circles) ")
p.add_tile("CartoDB.Positron")

# Color mappers
color_mapper_pm10 = CategoricalColorMapper(factors=list(epa_colors.keys()), palette=list(epa_colors.values()))
color_mapper_pm25 = CategoricalColorMapper(factors=list(epa_colors.keys()), palette=list(epa_colors.values()))
    
 # Draw PM10 hexagons
p.scatter(x='x', y='y', size=30, source=source,
              marker='hex',
              color={'field': 'category_10', 'transform': color_mapper_pm10},
              fill_alpha=1, line_color='black', line_width=1.5, legend_label="PM₁₀ (hexagons)")
    
# Draw PM2.5 circles on top
p.scatter(x='x', y='y', size=20, source=source,
              marker='circle',
              color={'field': 'category_25', 'transform': color_mapper_pm25},
              fill_alpha=1, line_color='black', line_width=1.5, legend_label="PM₂₋₅ (circles)")
p.legend.location = "top_left"

# Dummy glpyhs for legend
legend_items = []
for category, color in epa_labels.items():
    dummy = p.patch(
        x=[[-2, -2, -1.5, -1.5]],  # List of lists for xs
        y=[[-2, -1.5, -1.5, -2]],  # List of lists for ys
        color=color,
        alpha=1.0
    )
    legend_items.append(LegendItem(label=category, renderers=[dummy]))

category_legend = Legend(items=legend_items, title="      PM₂₋₅ (µg/m³)   PM₁₀  (µg/m³)")


# Add legends in different locations
p.add_layout(category_legend, 'center')         # Categorical legend on the left

# Hover tool
#hover = HoverTool(tooltips=[
#        ("Device", "@device_name"),
#        ("PM Value", "@pm10_rm{0.0} or @pm25_rm{0.0}"),
#        ("Category", "@epa_category"),
#        ("Time", "@timestamp_local{%F %T}")
#    ], formatters={'@timestamp_local': 'datetime'})
#p.add_tools(hover)
#p.legend.location = "top_left"
#p.legend.click_policy = "hide"
#output_notebook() 
#show(p)
layout = column(p, slider)
#output_notebook()
#show(layout)
output_file('bokeh_plot.html')
save(layout)
