class AE_Alastree {
    constructor(data) {
      this.parent = null;
      this.descendants = [];
      this.data = data;      
    }

    addChild(data) {        
        let child = new AE_Alastree(data);
        child.parent = this;    
        this.descendants.push(child);        
        return child;
      }

    findChildByData(property,propertyValue) {
        let nodes = [];
        if (this.data[property] == propertyValue )
        {
          nodes.push(this);
        }
        for( let i = 0; i < this.descendants.length; i++)
        {
          let rNodes = this.descendants[i].findChildByData(property, propertyValue);
          nodes.push(...rNodes);
        }
        return nodes;    
    
    }

}


module.exports = {
    AE_Alastree: AE_Alastree
    }