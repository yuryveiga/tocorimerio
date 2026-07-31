update blog_posts set
 content = replace(content,'/blog/why-visit-rio-de-janeiro','/blog/visit-rio-de-janeiro'),
 content_en = replace(coalesce(content_en,''),'/blog/why-visit-rio-de-janeiro','/blog/visit-rio-de-janeiro'),
 content_es = replace(coalesce(content_es,''),'/blog/why-visit-rio-de-janeiro','/blog/visit-rio-de-janeiro'),
 content_zh_cn = replace(coalesce(content_zh_cn,''),'/blog/why-visit-rio-de-janeiro','/blog/visit-rio-de-janeiro'),
 content_zh_tw = replace(coalesce(content_zh_tw,''),'/blog/why-visit-rio-de-janeiro','/blog/visit-rio-de-janeiro')
where concat_ws(' ',content,content_en,content_es,content_zh_cn,content_zh_tw) like '%/blog/why-visit-rio-de-janeiro%';