import json,datetime
p='DO NOT UPLOAD/data/blog.json'
with open(p,'r',encoding='utf-8') as f:
  data=json.load(f)
now=datetime.date.today().isoformat()
topics=[('ai-automation-for-small-businesses-2026','AI Automation for Small Businesses in 2026'),('best-ai-tools-for-local-service-businesses-2026','Best AI Tools for Local Service Businesses in 2026'),('how-ai-agents-help-trades-get-more-leads-2026','How AI Agents Help Trades Get More Leads in 2026'),('llm-chatbots-for-customer-support-2026','LLM Chatbots for Customer Support in 2026'),('ai-workflows-to-save-hours-2026','AI Workflows to Save Hours Every Week in 2026')]
hero=[1521737604893,1498050108023,1460925895917,1515378791038,1517694712202]
cats=[['AI','Business','Web Apps'],['AI','Local SEO','Business'],['AI','Local SEO','Business'],['AI','Web Apps','Business'],['AI','Web Apps','Business']]
added=0
for i,(slug,title) in enumerate(topics):
  if any(x['slug']==slug for x in data['posts']): continue
  alt=title+' - website design and web development services by KorTechX for businesses in London, USA, UK, Canada, Australia, New Zealand and the UAE'
  meta='Practical AI ideas to save time and get more leads for small businesses.'
  img='https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1100&q=80'
  body=f'<h2>{title}</h2><p>AI helps small businesses save time. <a href=\"service-ai-automation\">AI automation</a> drives results.</p><figure class=\"article-inline-img\"><img src=\"{img}\" alt=\"{alt}\" loading=\"lazy\"></figure><h2>Steps</h2><p>Start small. <a href=\"website-design-services\">Website design</a> and <a href=\"service-seo\">SEO</a>.</p>'
  data['posts'].append({'slug':slug,'title':title,'date':now,'category':cats[i][0],'tags':cats[i],'heroId':hero[i],'heroAlt':alt,'excerpt':meta,'meta':meta,'format':'short','words':len(body.split()),'bodyHtml':body})
  added+=1
with open(p,'w',encoding='utf-8') as f:
  json.dump(data,f,indent=2); f.write('\n')
print(added, len(data['posts']))
