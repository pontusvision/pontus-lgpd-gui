import PVGrid from './PVGrid';
import PontusComponent from "./PontusComponent";

//

class NavPanelInformationYouHoldPVGrid extends PVGrid
{
  
  
  componentDidMount()
  {
    this.setNamespace("NavPanelInformationYouHold");
    
    super.componentDidMount();
    
    let colSettings = [];
  
    colSettings[0] = {id: "Person.Natural.Title", name: "Título", field: "Person.Natural.Title", sortable: true};
    colSettings[1] = {id: "Person.Natural.Full_Name", name: "Nome Completo", field: "Person.Natural.Full_Name", sortable: true};
    colSettings[2] = {id: "Person.Natural.Age", name: "Idade", field: "Person.Natural.Age", sortable: true};
    colSettings[3] = {id: "Person.Natural.Gender", name: "Gênero", field: "Person.Natural.Gender", sortable: true};
    colSettings[4] = {id: "Person.Natural.Nationality", name: "Nacionalidade", field: "Person.Natural.Nationality", sortable: true};
    
    this.url = PontusComponent.getGraphURL(this.props);
    
    this.setColumnSettings(colSettings);
    this.setExtraSearch({value: "Person.Natural"});
    
    
  }
  
  
  getSearchObj = (from, to, searchstr, searchExact, cols, extraSearch, sortcol, sortdir) =>
  {
    this.from = from;
    this.to = to;
  
    let sortcolId = sortcol === null ? null : sortcol.id;
  
  
    let selectBody =
      "  .select('Person.Natural.Title' " +
      "         ,'Person.Natural.Full_Name' " +
      "         ,'Person.Natural.Age' " +
      "         ,'Person.Natural.Gender' " +
      "         ,'Person.Natural.Nationality' " +
      "         ,'event_id' " +
      "         )";
  
  
    return {
      gremlin: "g.V().has('Metadata.Type.Person.Natural',eq('Person.Natural'))\n" +
      " .order()\n" +
      " .by(pg_orderCol == null ? 'Person.Natural.Full_Name' :pg_orderCol.toString() ,pg_orderDir == (1)? incr: decr)\n" +
      " .range(pg_from,pg_to)\n" +
      " .as('people')\n" +
      " .match(\n" +
      "   __.as('people').values('Person.Natural.Title').as('Person.Natural.Title')\n" +
      " , __.as('people').values('Person.Natural.Full_Name').as('Person.Natural.Full_Name')\n" +
      " , __.as('people').values('Person.Natural.Date_Of_Birth').as('Person.Natural.Date_Of_Birth')\n" +
      " , __.as('people').values('Person.Natural.Date_Of_Birth').map{ it.get().getTime() }.as('Person.Natural.Date_Of_Birth_Millis')\n" +
      " , __.as('Person.Natural.Date_Of_Birth_Millis').math('(' +System.currentTimeMillis() + '- _)/(3600000*24*365)').map{  it.get().longValue()}.as('Person.Natural.Age')\n" +
      " , __.as('people').values('Person.Natural.Gender').as('Person.Natural.Gender')\n" +
      " , __.as('people').values('Person.Natural.Nationality').as('Person.Natural.Nationality')\n" +
      " , __.as('people').id().as('event_id')\n" +
      " )\n" +
      selectBody
      , bindings: {
        pg_from: from
        , pg_to: to
        , pg_orderCol: sortcolId
        , pg_orderDir: sortdir
      }
    
    
    };
  };
  
  // onError = (err, fromPage, toPage) =>
  // {
  //   // ignore.
  // };
  
  onSuccess = (resp) =>
  {
    
    let respParsed = {};
    let itemsParsed = [];
    
    
    try
    {
      if (typeof resp !== 'object')
      {
        respParsed = JSON.parse(resp);
      }
      else
      {
        respParsed = resp;
      }
      if (respParsed.status === 200)
      {
        let items = respParsed.data.result.data['@value'];
        
        
        for (let i = 0, ilen = items.length; i < ilen; i++)
        {
          let vals = items[i]['@value'];
          let itemParsed = {};
          
          for (let j = 0, jlen = vals.length; j < jlen; j += 2)
          {
            let key = vals[j];
            let val = vals[j + 1];
            if (val instanceof Object)
            {
              if (key === ("event_id"))
              {
                itemParsed['index'] = val['@value'];
              }
              else
              {
                if (val['@type'] === 'g:Date')
                {
                  itemParsed[key] = new Date(val['@value']);
                  
                }
                else
                {
                  itemParsed[key] = val['@value'];
                  
                }
              }
            }
            else
            {
              itemParsed[key] = val;
            }
          }
          itemsParsed[i] = (itemParsed);
          this.data[this.from + i] = itemsParsed[i];
          
        }
      }
      
      this.data.length = Math.min(itemsParsed.length + this.from, this.to); // limitation of the API
      
      if (this.data.length === this.to)
      {
        this.data.length++;
      }
      // if (this.data.length == this.to)
      
      this.req = null;
      
      this.onDataLoadedCb({from: this.from, to: this.to});
      
      
    }
    catch (e)
    {
      // e;
    }
    
    
  };
  
  
}


export default NavPanelInformationYouHoldPVGrid;
