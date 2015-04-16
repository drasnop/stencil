var geometry={
   "panelHeight": 340,
   "tabsHeight": 45
}

geometry.getOptionHeight=function(){
   if(model.optionsVisibility==1 && !model.fullPanel())
      return 38;

   return 28;
}
