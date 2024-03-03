# Access the base layer by its name
base_layer = QgsProject.instance().mapLayersByName('basedata')[0]

# Fields to be classified
fields_to_classify = ['1990', '1995', '2000', '2005', '2010', '2015', '2020']

# Custom classes with the updated color palette
classes = [
    (0, 0, '0', '#e5f5e0'),  # Class for values 0-0, set to white
    (1, 1000, '1 - 1,000', '#fff7ec'),
    (1001, 10000, '1,001 - 10,000', '#fee8c8'),
    (10001, 25000, '10,001 - 25,000', '#fdd49e'),  # Adjusted interval and color
    (25001, 50000, '25,001 - 50,000', '#fdbb84'),  # Shifted interval and color
    (50001, 90000, '50,001 - 90,000', '#fc8d59'),  # Shifted interval and color
    (90001, 150000, '90,001 - 150,000', '#f97b30'),  # Shifted interval and color
    (150001, 250000, '150,001 - 250,000', '#ef6548'),  # Shifted interval and color
    (250001, 400000, '250,001 - 400,000', '#d7301f'),  # Shifted interval and color
    (400001, 700000, '400,001 - 700,000', '#b30000'),  # Shifted interval and color
    (700001, 1000000, '700,001 - 1,000,000', '#7f0000'),  # Shifted interval and color
    (1000001, 2000000, '1,000,001 - 2,000,000', '#7f0000')  # Unchanged interval, color repeated for consistency
]

# Iterate over each field, duplicate the base layer, and apply the classification
for field_name in fields_to_classify:
    # Duplicate the layer
    layer_copy = base_layer.clone()
    layer_copy.setName(f"{base_layer.name()}_{field_name}")  # Set a unique name based on the year

    # Create a range for each class
    ranges = []
    for lower, upper, label, color in classes:
        symbol = QgsSymbol.defaultSymbol(layer_copy.geometryType())
        symbol.setColor(QColor(color))
        rng = QgsRendererRange(lower, upper, symbol, label)
        ranges.append(rng)

    # Create the renderer and assign it to the duplicated layer
    renderer = QgsGraduatedSymbolRenderer(field_name, ranges)
    renderer.setMode(QgsGraduatedSymbolRenderer.Custom)  # Set the mode to custom for these defined ranges
    layer_copy.setRenderer(renderer)

    # Add the duplicated layer to the project
    QgsProject.instance().addMapLayer(layer_copy)

    # Note: No need to manually trigger repaint or update the layers panel for each addition,
    # as adding the layer to the project does this inherently.
