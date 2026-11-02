# scivianna-vtk

Interactive VTK/PyVista visualization with vtk.js for Panel.

## Installation

```bash
pip install scivianna-vtk
```

## Usage

```python
import panel_material_ui as pmui
from scivianna_vtk import VTKPlotter, polydata_to_dict
import pyvista as pv

# Create a simple sphere
sphere = pv.Sphere(theta_resolution=30, phi_resolution=30)

# Create plotter and feed it the mesh
plotter = VTKPlotter()
plotter.update_polydata(sphere)

# Show with Panel
plotter.show()
```

For a full interactive demo (geometry switcher, colormap, clip plane, colorbar),
run the bundled example:

```python
from scivianna_vtk.example import ExamplePanel

ExamplePanel().show()
```

## Features

- Interactive 3D visualization using vtk.js
- Support for PolyData, UnstructuredGrid, StructuredGrid
- Cell hover information display
- Clip plane visualization and control
- Binary data transfer for efficient performance

## Dependencies

- panel >= 1.4.0
- param >= 2.0.0
- numpy >= 1.24.0
- pyvista >= 0.43.0
- vtk >= 9.0.0

## License

MIT