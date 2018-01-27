---
layout: post
title:  Custom MyFantasyLeague Skin
date:   2016-05-31
categories:
feature: spacer.gif
visible: nope
---
A fantasy football league in which I participate uses [MyFantasyLeague](http://home.myfantasyleague.com/) to manage everything—including schedules, drafts, lineups, trades, free agents, blah, blah, blah. It is a dynasty league which means you maintain a team in perpetuity, retaining players indefinitely instead of re-drafting a new team each year. Because this requires more robust data since there’s an added element of time (trades for draft picks two years away are common), it’s a fairly niche market so options are slim. MFL appears to actually be the best solution but their app, while very thorough in terms of data, is designed is so poorly that it’s basically unusable.

This is what the default ‘skin’ looks like (there are others, but they are equally hideous):

![Default MFL Skin]({{site.blog_img_path}}2016/mfl_default.jpg)

<br>There are things on that page that defy explanation—nested tables driving layout, 8px text, inline styles on everything, five different ‘main’ navigation elements. One big dumpster fire. And this is actually one of the better views in terms of usability.

Using a [Fluid](http://fluidapp.com/) app for this site, I created a user stylesheet that addresses some of the basic issues, making it a little more usable and a lot easier on the eyes. I’ve already noticed, and started using functionality that I never knew existed.

My version:

![Custom MFL Skin]({{site.blog_img_path}}2016/mfl_skin.jpg)

<br>A little better, huh? There is a lot (A LOT) of stuff still needed so this is very much a work-in-progress. But, if you use Fluid and are condemned to using MFL, you can grab these styles and enjoy some relief.

[MFL Skin Gist](https://gist.github.com/kyleruane/18a19605d9acb85078b28b1e089dce69)
