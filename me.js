let n=[1,2,4]
let m=[2,3,5,6]
n=[...n,...m]
console.log(n)
let mm=n.filter((v,i)=>{
    if(v>3) return v
});console.log(n.includes(4))