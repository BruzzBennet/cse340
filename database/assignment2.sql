Select * from account;

insert into account values (default,'Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n',default);

update account
set account_type = 'Admin'
where account_firstname='Tony' and account_lastname='Stark';

delete from account
where account_firstname='Tony' and account_lastname='Stark';

update inventory
set inv_description = replace(inv_description,'small interiors','a huge interior')
where inv_id=10;

select 
	inv_make,
	inv_model
from inventory i
inner join classification c
on c.classification_id=i.classification_id
where classification_name='Sport';

update inventory
set inv_thumbnail = replace(inv_thumbnail,'/images','/images/vehicles');