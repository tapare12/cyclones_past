1- Rendez-vous sur le site officiel d'IBTrACS NOAA.

https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/

telecharger les 3 csv suivants :
ibtracs.EP.list.v04r01.csv 
 (https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.EP.list.v04r01.csv)

ibtracs.SP.list.v04r01.csv
 (https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.SP.list.v04r01.csv)

ibtracs.WP.list.v04r01.csv
 (https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r01/access/csv/ibtracs.WP.list.v04r01.csv)


2- regrouper le html, les .js et les csv  dans un seul répertoire.

3- lancer CYCLONES-V5.HTML


options :

grossissement de la map 
dans zoom.js, modifier  :

   const ZOOM_MAX = 14;             // grossissement maximal de la carte


dans iles.js  :

Pour ajouter une île, copiez une ligne de ILES_PF et changez le nom, la latitude et la longitude. Les îles de la Société sont très proches les unes des autres, donc leurs étiquettes peuvent se chevaucher à l'échelle normale ; utilisez la molette pour zoomer sur cet archipel. Le groupe Gambier (Mangareva) n'est pas inclus, car il fait partie de l'archipel des Tuamotu-Gambier dans les découpages administratifs. Si vous souhaitez l'ajouter, il suffit de le placer dans la liste ILES_PF.

rectifier les latitudes et longitudes s'il y a des erreurs (j'ai pas eu le temps)
