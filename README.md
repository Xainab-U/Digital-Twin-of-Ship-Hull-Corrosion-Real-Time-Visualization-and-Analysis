
# ABOUT OUR PROJECT

# Digital-Twin-of-Ship-Hull-Corrosion


The Digital Twin of a Ship Hull for Illustrating Biofouling Dynamics project aims to develop a predictive maintenance system for ships, reducing downtime at ports for maintenance.
This system is part of a larger initiative to use underwater drones to capture images, interpolate them on a ship model, and mitigate biofouling.

Model Importation: The ship hull model was imported using the GLTF loader.
The model was made permanent to avoid importing different models each time.

Mesh Hierarchy: A 'Mesh Hierarchy' button was added to display the hierarchy of the model's mesh components.

Light and Scene Properties: Implemented functionality to alter light type and intensity.
Added an option to view the wireframe of the entire model.

Mesh Properties: Upon clicking a particular component of the model, the 'Mesh Properties' button gets activated. Users can change the color of the selected component and view its wireframe.
Detailed information about the component, such as the number of edges, vertices, and triangles, is displayed.

Progressive Corrosion Display: Introduced a button to show progressive corrosion.
When clicked, this feature updates images on the hull every 10 seconds to illustrate progressive corrosion. Logs of the date, time, and name of each image are displayed.

Hotspots: Added hotspots to the model.
Clicking on a hotspot displays its description along with values of resistance and corrosion.

These values are read from a CSV file using APIs.


__Instructions for installations and running the project : Refer Wiki Under the Repository name. [Instructions for execution](https://github.com/vaishnavickjnvbgk/Digital-Twin-of-Ship-Hull-Corrosion/wiki/Instructions-for-execution)__


# Overview of the Project

<img width="820" alt="1" src="https://github.com/user-attachments/assets/3d083336-18b2-497b-a5eb-81ed3e15673a">
<img width="815" alt="4" src="https://github.com/user-attachments/assets/08bdc64b-6eb3-4166-a7d1-daea57c5215c">
<img width="769" alt="3" src="https://github.com/user-attachments/assets/a4108142-aac8-4635-b6f7-0ffe9b23aaee">
<img width="719" alt="2" src="https://github.com/user-attachments/assets/87c3f430-e19f-4d90-a0d0-6febee892ebf">


