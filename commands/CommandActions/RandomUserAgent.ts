import userAgents from "../../userAgents";

const RandomUserAgent = async () =>{
  return  userAgents[Math.floor(Math.random() * userAgents.length)];

}
export default RandomUserAgent
