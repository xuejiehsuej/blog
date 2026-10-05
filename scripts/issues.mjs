export async function fetchIssuePosts({repo,token,fetcher=fetch}){
 const owner=repo.split('/')[0].toLowerCase(),posts=[];
 for(let page=1;;page++){
  const response=await fetcher(`https://api.github.com/repos/${repo}/issues?state=open&per_page=100&page=${page}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`GitHub API failed: ${response.status}; deployment cancelled`);
  const issues=await response.json();
  for(const issue of issues){
   if(issue.pull_request||issue.state!=='open'||issue.user?.login?.toLowerCase()!==owner||!issue.title.startsWith('[POST] '))continue;
   const body=issue.body||'';
   posts.push({id:`issue-${issue.number}`,title:issue.title.slice(7).trim(),category:issue.labels[0]?.name||'随笔',date:issue.created_at.slice(0,10),createdAt:issue.created_at,summary:body.replace(/^#+\s.*$/gm,'').trim().replace(/\n+/g,' ').slice(0,110),body,read:String(Math.max(1,Math.ceil(body.length/400)))});
  }
  if(issues.length<100)break;
 }
 return posts;
}
