Name: Dorottya Frisch

Topic: Freedom Across the World

Description:
For this project, I want to use the data available at Freedom House Index to expore whether the world is becoming more or less free.
The rising authoritarianism and the fall of liberal democracies has become a growing concern across the world, with more and more countries becoming seemingly less democratic.
In this project I want to look at the data provided by Freedom House, a non profit which assigns a democracy score to 
every country accross the world dating all the way back to 1973. Additionally, from 2003 Freedom House also publishes data on sub-categories, 
such as Personal Autonomy and Individual Rights, Rule of Law, Civil Liberties, and Freedom of Expression and Beliefs.

Freedom House already has a static visualization of the world for each year where it publishes it's data,
but it's difficult to compare the trends over time with only looking at static maps side by side. In this project I want to build a visualization similar to approach A,
where a map of the world would serve as the Core Interactive, and the visualization runs a simulation of how the world changed from 1973 until 2024. The user would also be able to select
whether they want to see the changes in the Freedom Score, or the changes in the subcategories I described above. It is possible that while the overall Freedom Score of a country is low,
they might excell in some of the subcategories, therefore I think this would make for an interesting comparison. For better legibility, the user would also be able to zoom in on regions
and watch the changes happen in a specific geographical region. I am not sure whether the best approach here is to allow the user to zoom in, or to have a menu option where they can select
the region, but I will put this as one of the questions I want feedback on. 

Data:
https://freedomhouse.org/report/freedom-world#Data
The dataset "Country and Territory Ratings and Statuses, 1973-2024" contains all of the Freedom Scores from 1973-2024 and would be used to build the base map.
The dataset "Aggregate Category and Subcategory Scores, 2003-2024" contains information on the subcategories listed above, however is only available from 2003, 
which is one of the limitations of the project.

The final product would be similar to the map Freedom House publishes every year (the 2024 map is available here: https://freedomhouse.org/explore-the-map?type=fiw&year=2024), but would
show the scores over time in a simulation, allowing for the user to better understand the trends. Additionally, the current Freedom House map does not allow for an easy zoom in, and in 
regions where countries are heavily concentrated (e.g. Europe, Central America), it makes it difficult to identify the status of specific countries. 

Questions:
1) How much context / text should I include with the data? The map seems like a strong visual, but I am unsure about how much additional context I should provide other than a ledger?
2) How should I handle looking at specific regions? Should I allow the user to zoom in, or should I include "region" in the selection tool?
3) Should I keep the map strictly a simulation, or should I also allow the user to select specific years they want to look at? If so, I am worried the map would be too similar
   to what Freedom House is already doing, but if not, I am wondering if the simulation itself gives enough information.

(Very Bad) Sketches:
(The user will be able to select different options from the toolbar on the top)
<img width="406" alt="Screenshot 2024-11-09 at 20 55 39" src="https://github.com/user-attachments/assets/ecdd7629-76a6-42c8-b4ee-059d1013fb4e">
<img width="420" alt="Screenshot 2024-11-09 at 20 55 46" src="https://github.com/user-attachments/assets/eccb49fb-d073-469d-b3a9-1fc0eb7be526">


