const cds = require('@sap/cds');
const { COMMIT } = require('@sap/cds/libx/_runtime/db/utils/coloredTxCommands');


class CatalogService extends cds.ApplicationService {init(){
  

  const { ExpressPrice,DNExpress  } = cds.entities ('com.expressprice');
  // const { DNExpress } = cds.entities ('com.expressprice.DNExpress');

  // Register your event handlers in here, for example, ...
  // this.after ('','BooksExpressCost', each => {
  //   if (each.stock > 111) {
  //     each.title += ` -- 11% discount!`
  //   }
  // });
  this.on ('insertExpress', async req => {
    const {outboundDelivery,originProvince,targetProvince,grossWeight} = req.data; 
    let tag = originProvince+targetProvince;
    console.log(tag);
    // let {basePrice,scalePrice } = await SELECT  `basePrice,scalePrice` .from  `ExpressPrice` .where `tag='${tag}'`;

     let {basePrice,scalePrice } = await SELECT `basePrice,scalePrice` .from  (ExpressPrice,tag);
    let expressCost = 0;
    
    if(Number(grossWeight)  < 1){
      expressCost = Number(basePrice);
    }else{
      expressCost =  Number(basePrice) + ( Number(grossWeight) - 1) *  Number(scalePrice);
    }
    console.log(expressCost);
    let expressCostStr = toString(expressCost);
    const dnExpress = {outboundDelivery:outboundDelivery,originProvince:originProvince,targetProvince:targetProvince,basePrice: basePrice,scalePrice:scalePrice,grossWeight:grossWeight,expressCost:expressCost };
    await INSERT (dnExpress) .into (DNExpress);
    await COMMIT;
    // await INSERT (DNExpress,outboundDelivery) .with ({ outboundDelivery: outboundDelivery,originProvince:originProvince,targetProvince:targetProvince,basePrice:basePrice,scalePrice:scalePrice,grossWeight:grossWeight,expressCost:expressCost});
   return { expressCostStr };
  });
  this.on ('updateExpress', async req => {
    const {outboundDelivery,cpCode,logisticCode, logisticTrace} = req.data; 
    let dn = await SELECT `outboundDelivery` .from (DNExpress,outboundDelivery);
    if(!dn) return req.error(404,`DN ${outboundDelivery} does not exist`)
    await UPDATE (DNExpress,outboundDelivery) .with ({ cpCode: cpCode,logisticCode:logisticCode,logisticTrace:logisticTrace });
  await COMMIT;
  return {logisticCode};
  });


  // this.on("CREATE",'DNExpress', async handl=>{
  // const {outboundDelivery,originProvince,targetProvince,grossWeight,} = handl.data;
  // let tag = originProvince+targetProvince;
  // let {basePrice,scalePrice} = await SELECT `basePrice` `scalePrice` .from (ExpressPrice,tag);
  // await CREATE (DNExpress,tag) .with ({outboundDelivery:outboundDelivery,})


  // });
  return super.init();
}}

module.exports = { CatalogService };