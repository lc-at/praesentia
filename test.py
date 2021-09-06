from praesentia.simaster import SimasterQrPresence

sqp = SimasterQrPresence()
print(sqp.login('faiz.uni2003', 'Msft2021'))
print(sqp.send_qr_presence('34303035-6261-4630-b132-34393763326438298fa1-3634-4523-ade1-47dfe674e1d3#@!$$2y$10$XB3h4hq5vQXnZIRm0pppNuUBR9CJZHurJSAivkFeBoqDF5ImXjCbS', -116, 118))
